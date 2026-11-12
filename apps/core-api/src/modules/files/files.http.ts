import { withOrg } from '@erxes/core-db';
import { createReadStream, createWriteStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { link, rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Router, type Response } from 'express';
import { config } from '~/config';
import { callerOf } from '~/http/auth';
import { recordAudit } from '~/modules/audit/audit.service';
import { downloadUrlOf, readyFile } from './files.service';
import { contentDisposition, localPath, readGrant } from './storage';

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ defined: false, code, status, message });

/**
 * Signed links of the local driver (`/core/v1/files/signed/<token>`): the
 * token says which object, what may be done and until when. Mounted before
 * the JSON body parser, so uploads stream to disk untouched.
 */
export const signedFilesRouter = Router();

signedFilesRouter.put('/:token', async (req, res) => {
  const grant = readGrant(req.params.token);

  if (config.files.driver !== 'local' || !grant || grant.op !== 'put') {
    fail(res, 403, 'INVALID_LINK', 'This upload link is not valid or has expired');

    return;
  }

  const [contentType = ''] = (req.get('content-type') ?? '').split(';');

  if (contentType.trim().toLowerCase() !== grant.contentType) {
    fail(res, 400, 'CONTENT_TYPE_MISMATCH', `Send the file as ${grant.contentType}`);

    return;
  }

  const declared = Number(req.get('content-length'));

  if (Number.isFinite(declared) && declared !== grant.size) {
    fail(res, 400, 'SIZE_MISMATCH', 'The file size differs from the one declared');

    return;
  }

  const target = localPath(grant.key);
  // One partial file per attempt: two PUTs on one link never write into each other.
  const partial = `${target}.${randomUUID()}.part`;
  let received = 0;

  req.on('data', (chunk: Buffer) => {
    received += chunk.length;

    if (received > (grant.size ?? 0)) {
      req.destroy(new Error('too large'));
    }
  });

  const stored = await pipeline(req, createWriteStream(partial, { flags: 'wx' })).then(
    () => received === grant.size,
    // Cut off, or destroyed above for being larger than declared.
    () => false,
  );

  // Uploaded once: the link can't replace bytes already sent (a hard link never overwrites).
  const linked =
    stored &&
    (await link(partial, target).then(
      () => true,
      () => false,
    ));

  await rm(partial, { force: true });

  if (!stored) {
    if (!res.headersSent) {
      fail(res, 400, 'SIZE_MISMATCH', 'The upload was cut off or differs from the size declared');
    }

    return;
  }

  if (!linked) {
    fail(res, 409, 'ALREADY_UPLOADED', 'This upload link was already used');

    return;
  }

  res.status(204).end();
});

signedFilesRouter.get('/:token', (req, res) => {
  const grant = readGrant(req.params.token);

  if (config.files.driver !== 'local' || !grant || grant.op !== 'get') {
    fail(res, 403, 'INVALID_LINK', 'This link is not valid or has expired');

    return;
  }

  const stream = createReadStream(localPath(grant.key));

  stream.on('error', () => {
    if (!res.headersSent) {
      fail(res, 404, 'NOT_FOUND', 'File not found');
    }
  });
  stream.on('open', () => {
    res.setHeader('Content-Type', grant.contentType ?? 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      contentDisposition(grant.name ?? 'file', Boolean(grant.inline)),
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Even a file shown inline can't run scripts or reach erxes.
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
    );
    res.setHeader('Cache-Control', `private, max-age=${config.files.linkTtlSeconds}`);
    stream.pipe(res);
  });
});

/**
 * `GET /core/v1/files/:id/download` for signed-in members and plugins: a
 * stable address (for `<img src>`, links) that checks access, then redirects
 * to a short-lived storage link. `?download=1` saves instead of showing.
 */
export const downloadRouter = Router();

downloadRouter.get('/files/:id/download', async (req, res) => {
  const caller = callerOf(req);

  const url = await withOrg(caller.orgId, async (tx) => {
    const row = await readyFile(tx, caller.orgId, req.params.id);
    const saving = req.query.download === '1';
    const address = await downloadUrlOf(row, saving);

    // Saving a copy is audited; showing a picture inline (avatars, previews) is not.
    if (saving) {
      await recordAudit(tx, caller, {
        action: 'file.downloaded',
        targetType: 'file',
        targetId: row.id,
        targetLabel: row.name,
      });
    }

    return address;
  });

  res.setHeader('Cache-Control', 'private, no-store');
  res.redirect(302, url);
});

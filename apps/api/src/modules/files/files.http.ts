import { files, requestOrgId, withOrg, withSystem } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createReadStream, createWriteStream } from 'node:fs';
import { link, rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
import { config } from '~/config';
import { enforceKeyAccess } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { randomUUID } from '~/lib/crypto';
import { recordAudit } from '~/modules/audit/audit.service';
import { downloadUrlOf, readyFile } from './files.service';
import { contentDisposition, localPath, readGrant } from './storage';

/**
 * Signed links of the local driver (`/core/v1/files/signed/<token>`): the
 * token says which object, what may be done and until when. Mounted before
 * the JSON body parser, so uploads stream to disk untouched.
 */
export const signedFilesRouter = Router();

signedFilesRouter.put('/:token', async (req, res) => {
  const grant = readGrant(req.params.token);

  if (config.files.driver !== 'local' || !grant || grant.op !== 'put') {
    throw fail('INVALID_SIGNATURE', 'This upload link is not valid or has expired');
  }

  const [contentType = ''] = (req.get('content-type') ?? '').split(';');

  if (contentType.trim().toLowerCase() !== grant.contentType) {
    throw fail('CONTENT_TYPE_MISMATCH', `Send the file as ${grant.contentType}`);
  }

  const declared = Number(req.get('content-length'));

  if (Number.isFinite(declared) && declared !== grant.size) {
    throw fail('SIZE_MISMATCH', 'The file size differs from the one declared');
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
    if (res.headersSent) return;

    throw fail('SIZE_MISMATCH', 'The upload was cut off or differs from the size declared');
  }

  if (!linked) throw fail('ALREADY_UPLOADED', 'This upload link was already used');

  res.status(204).end();
});

signedFilesRouter.get('/:token', (req, res, next) => {
  const grant = readGrant(req.params.token);

  if (config.files.driver !== 'local' || !grant || grant.op !== 'get') {
    throw fail('INVALID_SIGNATURE', 'This link is not valid or has expired');
  }

  const stream = createReadStream(localPath(grant.key));

  stream.on('error', () => {
    if (!res.headersSent) next(notFound('File'));
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
  await enforceKeyAccess('files.get');

  const url = await withOrg(requestOrgId(), async (tx) => {
    const row = await readyFile(tx, req.params.id);
    const saving = req.query.download === '1';
    const address = await downloadUrlOf(tx, row, saving);

    // Saving a copy is audited; showing a picture inline (avatars, previews) is not.
    if (saving) {
      await recordAudit(tx, {
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

const PublicId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

/**
 * `GET /core/v1/files/public/:id` for anyone, with no sign-in: pictures in emails, which
 * mail clients fetch on their own. Only a ready file uploaded as public answers; every
 * other id is a 404, so the address shows nothing else and lists nothing.
 */
export const publicFilesRouter = Router();

publicFilesRouter.get('/files/public/:id', async (req, res) => {
  const id = PublicId.safeParse(req.params.id);

  const [row] = id.success
    ? await withSystem('public file lookup', (tx) =>
        tx
          .select()
          .from(files)
          .where(and(eq(files.id, id.data), eq(files.public, true), eq(files.status, 'ready')))
          .limit(1),
      )
    : [];

  if (!row) throw notFound('File');

  res.setHeader('Cache-Control', 'public, max-age=300');
  res.redirect(302, await withOrg(row.orgId, (tx) => downloadUrlOf(tx, row, false)));
});

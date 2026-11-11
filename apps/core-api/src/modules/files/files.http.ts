import { db } from '@erxes/core-db';
import { createReadStream, createWriteStream } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Router, type Request, type Response } from 'express';
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

signedFilesRouter.put('/:token', (req: Request, res: Response) => {
  const grant = readGrant(req.params.token ?? '');

  if (config.files.driver !== 'local' || !grant || grant.op !== 'put') {
    fail(res, 403, 'INVALID_LINK', 'This upload link is not valid or has expired');

    return;
  }

  if ((req.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase() !== grant.contentType) {
    fail(res, 400, 'CONTENT_TYPE_MISMATCH', `Send the file as ${grant.contentType}`);

    return;
  }

  const declared = Number(req.get('content-length'));

  if (Number.isFinite(declared) && declared !== grant.size) {
    fail(res, 400, 'SIZE_MISMATCH', 'The file size differs from the one declared');

    return;
  }

  const target = localPath(grant.key);
  const partial = `${target}.${process.pid}.part`;
  let received = 0;

  req.on('data', (chunk: Buffer) => {
    received += chunk.length;

    if (received > (grant.size ?? 0)) {
      req.destroy(new Error('too large'));
    }
  });

  pipeline(req, createWriteStream(partial, { flags: 'w' }))
    .then(async () => {
      if (received !== grant.size) {
        await rm(partial, { force: true });
        fail(res, 400, 'SIZE_MISMATCH', 'The file size differs from the one declared');

        return;
      }

      await rename(partial, target);
      res.status(204).end();
    })
    .catch(async (error: unknown) => {
      req.log.warn({ err: error, key: grant.key }, 'upload failed');
      await rm(partial, { force: true });

      if (!res.headersSent) {
        fail(res, 400, 'SIZE_MISMATCH', 'The upload was cut off or larger than declared');
      }
    });
});

signedFilesRouter.get('/:token', (req: Request, res: Response) => {
  const grant = readGrant(req.params.token ?? '');

  if (config.files.driver !== 'local' || !grant || grant.op !== 'get') {
    fail(res, 403, 'INVALID_LINK', 'This link is not valid or has expired');

    return;
  }

  const stream = createReadStream(localPath(grant.key));

  stream.on('error', (error) => {
    req.log.warn({ err: error, key: grant.key }, 'could not read a stored file');

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

downloadRouter.get('/files/:id/download', (req: Request, res: Response, next) => {
  const caller = callerOf(req);

  readyFile(db(), caller.orgId, req.params.id ?? '')
    .then(async (row) => {
      const saving = req.query.download === '1';
      const url = await downloadUrlOf(row, saving);

      // Saving a copy is audited; showing a picture inline (avatars, previews) is not.
      if (saving) {
        await recordAudit(db(), caller, {
          action: 'file.downloaded',
          targetType: 'file',
          targetId: row.id,
          targetLabel: row.name,
        });
      }

      res.setHeader('Cache-Control', 'private, no-store');
      res.redirect(302, url);
    })
    .catch(next);
});

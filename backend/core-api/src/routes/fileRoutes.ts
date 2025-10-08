import {
  getEnv,
  getSubdomain,
  isImage,
  sanitizeFilename,
  sanitizeKey,
} from 'erxes-api-shared/utils';
import { NextFunction, Request, Response, Router } from 'express';
import * as formidable from 'formidable';
import * as os from 'os';
import { filterXSS } from 'xss';
import { generateModels } from '~/connectionResolvers';
import {
  checkFile,
  deleteFile,
  isValidPath,
  resizeImage,
  uploadFile,
} from '~/utils/file';
import { readFileRequest } from '~/utils/file/read';

// new imports
import fs from 'fs/promises';
import path from 'path';
import { lookup as mimeLookup } from 'mime-types';
import contentDisposition from 'content-disposition';

const router: Router = Router();

const DOMAIN = getEnv({ name: 'DOMAIN' });

interface ReadFileQuery {
  key?: string;
  inline?: string;
  name?: string;
  width?: number;
}

router.get(
  '/read-file',
  async (
    req: Request<never, never, never, ReadFileQuery>,
    res: Response,
    next: NextFunction,
  ) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    try {
      const { key, inline, name, width = 0 } = req.query || {};

      const stringKey = Array.isArray(key) ? key[0] : key;

      const sanitizedKey: string = sanitizeKey(stringKey);

      if (!sanitizedKey) {
        return res.status(400).send('Invalid key');
      }

      const response = await readFileRequest({
        key: sanitizedKey,
        models,
        width,
      });

      // derive mime type safely
      const ext = path.extname(sanitizedKey); // includes leading dot
      const mimeType = mimeLookup(ext) || 'application/octet-stream';
      const filename = name ? String(name) : sanitizedKey;

      if (inline && inline === 'true') {
        // safe Content-Disposition and Content-Type
        res.setHeader('Content-Disposition', contentDisposition(filename, { type: 'inline' }));
        res.setHeader('Content-Type', mimeType);

        return res.send(response);
      }

      // attachment: use sanitizedKey (encoded by contentDisposition)
      res.setHeader('Content-Disposition', contentDisposition(filename, { type: 'attachment' }));
      res.setHeader('Content-Type', mimeType);

      return res.send(response);
    } catch (e) {
      const message = (e as Error).message || '';
      if (message.includes('key does not exist')) {
        return res.status(404).send('Not found');
      }

      // debugError(e);

      return next(e);
    }
  },
);

router.post('/upload-file', async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const domain = DOMAIN.replace('<subdomain>', subdomain);
  const models = await generateModels(subdomain);

  // robust parsing of query numbers
  const maxHeight = Number(req.query.maxHeight || 0);
  const maxWidth = Number(req.query.maxWidth || 0);

  const form = new formidable.IncomingForm({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  // helper to parse form as a Promise
  const parseForm = (frm: formidable.IncomingForm, request: Request) =>
    new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      frm.parse(request, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

  // We'll try to remove temp files in finally
  let originalFilePath: string | undefined;
  let processedFilePath: string | undefined;

  try {
    const { files } = await parseForm(form, req);

    const uploaded = (files as any).file || (files as any).upload;

    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // support both 'filepath' (formidable v2+) and 'path' (older)
    const filepath: string | undefined = (file as any).filepath || (file as any).path;
    originalFilePath = filepath;

    if (!filepath || !isValidPath(filepath)) {
      return res.status(400).send('Invalid or unsafe file path');
    }

    const mimetype = (file as any).mimetype || (file as any).type;

    if (!mimetype) {
      return res
        .status(400)
        .send('One or more files have unrecognized MIME type');
    }

    let processedFile: any = file;

    if (isImage(mimetype) && maxHeight > 0 && maxWidth > 0) {
      processedFile = await resizeImage(file, maxWidth, maxHeight);
    }

    // processedFile may have filepath or path
    processedFilePath = (processedFile?.filepath as string) || (processedFile?.path as string);

    const status = await checkFile(models, processedFile, req.headers.source as string | undefined);

    if (status !== 'ok') {
      return res.status(400).send(status);
    }

    try {
      const result = await uploadFile(
        `${domain}/gateway`,
        processedFile,
        !!(files && (files as any).upload),
        models,
      );

      res.send(result);
    } catch (e) {
      return res.status(500).send(filterXSS((e as Error).message || 'upload error'));
    }
  } catch (error) {
    // formidable parse error or other error
    return res
      .status(400)
      .send(`File upload parsing error: ${(error as Error).message || String(error)}`);
  } finally {
    // best-effort cleanup of temp files created under os.tmpdir()
    const tryUnlink = async (p?: string) => {
      if (!p) return;
      try {
        // avoid deleting non-temp files
        if (p.startsWith(os.tmpdir())) {
          await fs.unlink(p).catch(() => null);
        }
      } catch {
        // swallow cleanup errors
      }
    };

    // delete processed file first (if different)
    await tryUnlink(processedFilePath);
    // then delete original
    await tryUnlink(originalFilePath);
  }
});

router.post('/delete-file', async (req: Request, res: Response) => {
  // require login - replace with real auth middleware in future
  if (!req.headers.userid) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const sanitizedFilename = sanitizeFilename(req.body.fileName);

  if (!sanitizedFilename) {
    return res.status(400).send('Invalid fileName');
  }

  const status = await deleteFile(models, sanitizedFilename);

  if (status === 'ok') {
    return res.send({ status: 'ok' });
  }

  return res.status(500).send(status);
});

export { router };

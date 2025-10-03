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

      if (inline && inline === 'true') {
        const extension = sanitizedKey.split('.').pop();

        res.setHeader('Content-disposition', 'inline; filename="' + key + '"');
        res.setHeader('Content-type', `application/${extension}`);

        return res.send(response);
      }

      res.attachment(name || key);

      return res.send(response);
    } catch (e) {
      if ((e as Error).message.includes('key does not exist')) {
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

  const maxHeight = Number(req.query.maxHeight);
  const maxWidth = Number(req.query.maxWidth);

  const form = new formidable.IncomingForm({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  form.parse(req, async (error, _fields, files) => {
    if (error) {
      return res
        .status(400)
        .send(`File upload parsing error: ${error.message}`);
    }

    const uploaded = files.file || files.upload;

    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!file?.filepath || !isValidPath(file.filepath)) {
      return res.status(400).send('Invalid or unsafe file path');
    }

    const mimetype = file?.mimetype;

    if (!mimetype) {
      return res
        .status(400)
        .send('One or more files have unrecognized MIME type');
    }

    let processedFile = file;

    if (isImage(mimetype) && maxHeight && maxWidth) {
      processedFile = await resizeImage(file, maxWidth, maxHeight);
    }

    const status = await checkFile(models, processedFile, req.headers.source);

    if (status !== 'ok') {
      return res.status(400).send(status);
    }

    try {
      const result = await uploadFile(
        `${domain}/gateway`,
        processedFile,
        !!files.upload,
        models,
      );

      res.send(result);
    } catch (e) {
      return res.status(500).send(filterXSS(e.message));
    }
  });
});

router.post('/delete-file', async (req: Request, res: Response) => {
  // require login
  if (!req.headers.userid) {
    return res.end('forbidden');
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const sanitizedFilename = sanitizeFilename(req.body.fileName);

  const status = await deleteFile(models, sanitizedFilename);

  if (status === 'ok') {
    return res.send(status);
  }

  return res.status(500).send(status);
});

export { router };

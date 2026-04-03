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
import crypto from 'crypto';
import multer from 'multer';
import tmp from 'tmp';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

interface UploadStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  key?: string;
  error?: string;
  fileName?: string;
  progress?: number;
}

const router: Router = Router();

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many read-file requests, please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests, please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const chunkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many chunk upload requests, please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const DOMAIN = getEnv({ name: 'DOMAIN' });

interface ReadFileQuery {
  key?: string;
  inline?: string;
  name?: string;
  width?: number;
}

router.get(
  '/read-file',
  readLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    try {
      const { key, inline, name, width = 0 } = (req.query || {}) as ReadFileQuery;

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

router.post('/upload-file', uploadLimiter, async (req: Request, res: Response) => {
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

router.post('/delete-file', uploadLimiter, async (req: Request, res: Response) => {
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

// chunked upload for large files

const tmpDir = tmp.dirSync({ unsafeCleanup: true });

const upload = multer({
  dest: tmpDir.name,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    // Check the file type (MIME type)
    cb(null, true); // Accept the file
  },
});

const uploadStore = new Map<string, UploadStatus>();

const chunkStore = new Map<
  string,
  {
    chunks: Set<number>;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    uploadId: string;
  }
>();

// 1. Initialize chunked upload
router.post('/upload-chunked/init', uploadLimiter, (req, res) => {
  const { fileName, fileSize, totalChunks } = req.body;
  const uploadId = crypto.randomUUID();

  chunkStore.set(uploadId, {
    chunks: new Set(),
    totalChunks: Number(totalChunks),
    fileName,
    fileSize: Number(fileSize),
    uploadId,
  });

  res.json({ uploadId });
});

// 2. Upload a chunk
router.post(
  '/upload-chunked/chunk',
  chunkLimiter,
  upload.single('chunk'),
  async (req: Request, res: Response) => {
    const subdomain = getSubdomain(req);
    const domain = DOMAIN.replace('<subdomain>', subdomain);
    const models = await generateModels(subdomain);
    const { uploadId, chunkIndex } = req.body;
    const file = (req as Request & { file?: { path: string; mimetype: string; originalname: string; size: number } }).file;

    if (!file || !uploadId || chunkIndex === undefined) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const chunkIndexNum = Number(chunkIndex);
    if (!Number.isInteger(chunkIndexNum) || chunkIndexNum < 0) {
      return res.status(400).json({ error: 'Invalid chunkIndex' });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(uploadId)) {
      return res.status(400).json({ error: 'Invalid uploadId' });
    }

    const uploadInfo = chunkStore.get(uploadId);
    if (!uploadInfo) {
      return res
        .status(404)
        .json({ error: 'Upload session expired or invalid' });
    }

    // Save chunk
    const chunkDir = path.join(tmpDir.name, uploadId);
    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });
    const chunkPath = path.join(chunkDir, `chunk-${chunkIndexNum}`);

    // Ensure resolved path stays within the temp directory
    if (!path.resolve(chunkPath).startsWith(path.resolve(tmpDir.name) + path.sep)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    fs.renameSync(file.path, chunkPath);

    // Mark chunk as received
    uploadInfo.chunks.add(Number(chunkIndex));
    chunkStore.set(uploadId, uploadInfo); // ← IMPORTANT: persist the Set update

    res.json({
      success: true,
      received: uploadInfo.chunks.size,
      total: uploadInfo.totalChunks,
    });

    // ←←← CRITICAL: Trigger merge OUTSIDE the request/response cycle
    // This runs even if the client disconnects or another instance gets the request
    if (uploadInfo.chunks.size === uploadInfo.totalChunks) {
      setImmediate(async () => {
        try {
          // Re-read latest state (in case of race)
          const latestInfo = chunkStore.get(uploadId);
          if (!latestInfo || latestInfo.chunks.size < latestInfo.totalChunks)
            return;

          // Merge chunks
          const finalPath = path.join(tmpDir.name, `${uploadId}-final`);
          const writeStream = fs.createWriteStream(finalPath);
          for (let i = 0; i < latestInfo.totalChunks; i++) {
            const cp = path.join(chunkDir, `chunk-${i}`);
            if (fs.existsSync(cp)) {
              writeStream.write(fs.readFileSync(cp));
              fs.unlinkSync(cp);
            }
          }
          writeStream.end();

          await new Promise<void>((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', (err) => reject(err));
          });

          // ←←← STATUS UPDATE – THIS MUST RUN
          uploadStore.set(uploadId, {
            id: uploadId,
            status: 'processing',
            fileName: latestInfo.fileName,
            progress: 80,
          });

          const response = await uploadFile(
            `${domain}/gateway`,
            {
              path: finalPath,
              originalname: latestInfo.fileName,
              mimetype: file.mimetype,
              type: file.mimetype,
              size: latestInfo.fileSize,
              name: file.originalname,
            },
            false,
            models,
          );

          uploadStore.set(uploadId, {
            id: uploadId,
            status: 'completed',
            key: response,
            fileName: latestInfo.fileName,
            progress: 100,
          });

          setTimeout(() => {
            uploadStore.delete(uploadId);
            chunkStore.delete(uploadId);
          }, 5 * 60 * 1000);

          // Cleanup
          try {
            fs.unlinkSync(finalPath);
          } catch {
            console.error('Failed to unlink final file:', finalPath);
          }
          try {
            fs.rmdirSync(chunkDir, { recursive: true });
          } catch {
            console.error('Failed to remove chunk directory:', chunkDir);
          }
        } catch (err: unknown) {
          console.error('Final merge/upload failed:', err);
          uploadStore.set(uploadId, {
            id: uploadId,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Processing failed',
            fileName: uploadInfo.fileName,
          });
        }
      });
    }
  },
);

export { router };

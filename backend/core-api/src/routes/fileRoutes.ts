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

/** Tracks the lifecycle of a chunked file upload through processing stages. */
interface IUploadStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  key?: string;
  error?: string;
  fileName?: string;
  progress?: number;
}

const router: Router = Router();

/**
 * Extracts the real client IP from X-Forwarded-For header, falling back to req.ip.
 * Reads the rightmost entry because the gateway appends (not prepends) the real IP,
 * so leftmost values are attacker-controllable via a forged XFF header.
 */
const getClientIp = (req: Request): string => {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const parts = (Array.isArray(xff) ? xff[0] : xff).split(',');
    return parts[parts.length - 1].trim();
  }
  return req.ip || 'unknown';
};

/**
 * Creates a rate limiter with shared defaults (15-min window, JSON error envelope).
 * @param max - Maximum requests per window per IP.
 * @param message - Human-readable message returned in the 429 response body.
 */
const createLimiter = (max: number, message: string) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    keyGenerator: getClientIp,
    handler: (_req, res) => {
      res.status(429).json({
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message,
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

const readLimiter = createLimiter(1000, 'Too many read-file requests, please try again later.');
const uploadLimiter = createLimiter(200, 'Too many upload requests, please try again later.');
const chunkLimiter = createLimiter(1000, 'Too many chunk upload requests, please try again later.');

const DOMAIN = getEnv({ name: 'DOMAIN' });

/** Query parameters accepted by the /read-file endpoint. */
interface IReadFileQuery {
  key?: string;
  inline?: string;
  name?: string;
  width?: string;
}

router.get(
  '/read-file',
  readLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    try {
      const { key, inline, name, width } = (req.query || {}) as IReadFileQuery;
      const parsedWidth = Number(width ?? 0);

      if (!Number.isFinite(parsedWidth) || parsedWidth < 0) {
        return res.status(400).send('Invalid width');
      }

      const stringKey = Array.isArray(key) ? key[0] : key;

      const sanitizedKey: string = sanitizeKey(stringKey);

      if (!sanitizedKey) {
        return res.status(400).send('Invalid key');
      }

      const response = await readFileRequest({
        key: sanitizedKey,
        models,
        width: parsedWidth,
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

      if (
        (e as { code?: string }).code === 'AccessDenied' ||
        (e as Error).message.includes('Access Denied')
      ) {
        return res.status(403).send('Access denied');
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      return res.status(500).send(filterXSS(message));
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

/**
 * Chunked upload for large files.
 * Flow: POST /init -> POST /chunk (repeated) -> GET /status/:id (polling).
 * Chunks are stored in a temp directory and merged once all arrive.
 */
const tmpDir = tmp.dirSync({ unsafeCleanup: true });

const upload = multer({
  dest: tmpDir.name,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    // Check the file type (MIME type)
    cb(null, true); // Accept the file
  },
});

/**
 * In-memory store tracking upload status through processing/completed/failed.
 * Polled by GET /upload-chunked/status/:uploadId. Entries auto-expire after 5 min.
 */
const uploadStore = new Map<string, IUploadStatus>();

/**
 * Tracks which chunks have been received for each in-progress upload session.
 * Keyed by server-generated UUID from /upload-chunked/init.
 */
const chunkStore = new Map<
  string,
  {
    chunks: Set<number>;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    uploadId: string;
    createdAt: number;
  }
>();

/** Evict abandoned upload sessions older than 30 minutes to prevent memory leaks. */
const CHUNK_SESSION_TTL = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, info] of chunkStore.entries()) {
    if (now - info.createdAt > CHUNK_SESSION_TTL) {
      chunkStore.delete(id);
      uploadStore.delete(id);
      const staleDir = path.join(tmpDir.name, info.uploadId);
      try {
        fs.rmSync(staleDir, { recursive: true, force: true });
      } catch { /* already cleaned up */ }
    }
  }
}, 5 * 60 * 1000).unref();

/** Initialize a chunked upload session, returning a server-generated uploadId. */
router.post('/upload-chunked/init', uploadLimiter, (req, res) => {
  const { fileName, fileSize, totalChunks } = req.body;

  const parsedSize = Number(fileSize);
  const parsedChunks = Number(totalChunks);

  if (
    !fileName ||
    typeof fileName !== 'string' ||
    !Number.isFinite(parsedSize) ||
    parsedSize <= 0 ||
    !Number.isInteger(parsedChunks) ||
    parsedChunks <= 0
  ) {
    return res.status(400).json({ error: 'Missing or invalid required fields: fileName, fileSize, totalChunks' });
  }

  const uploadId = crypto.randomUUID();

  chunkStore.set(uploadId, {
    chunks: new Set(),
    totalChunks: parsedChunks,
    fileName,
    fileSize: parsedSize,
    uploadId,
    createdAt: Date.now(),
  });

  res.json({ uploadId });
  return null;
});

/** Receive a single chunk; once all chunks arrive, merge and upload the final file. */
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

    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(uploadId)) {
      return res.status(400).json({ error: 'Invalid uploadId' });
    }

    const uploadInfo = chunkStore.get(uploadId);
    if (!uploadInfo) {
      return res
        .status(404)
        .json({ error: 'Upload session expired or invalid' });
    }

    if (chunkIndexNum >= uploadInfo.totalChunks) {
      return res.status(400).json({ error: 'Chunk index out of range' });
    }

    /**
     * Use the server-generated UUID stored in chunkStore rather than the
     * sanitized user input (`uploadId`) for all filesystem paths.
     * This prevents path-traversal attacks even if sanitization is bypassed.
     */
    const trustedId = uploadInfo.uploadId;

    const chunkDir = path.join(tmpDir.name, trustedId);
    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndexNum}`);

    // Ensure resolved path stays within the temp directory
    if (
      !path.resolve(chunkPath).startsWith(path.resolve(tmpDir.name) + path.sep)
    ) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    fs.renameSync(file.path, chunkPath);

    uploadInfo.chunks.add(chunkIndexNum);
    chunkStore.set(trustedId, uploadInfo);

    res.json({
      success: true,
      received: uploadInfo.chunks.size,
      total: uploadInfo.totalChunks,
    });

    /**
     * Once all chunks arrive, merge them into a single file and upload
     * via `setImmediate` so the 200 response is sent before the heavy I/O.
     */
    if (uploadInfo.chunks.size === uploadInfo.totalChunks) {
      const existing = uploadStore.get(trustedId);
      if (
        existing &&
        (existing.status === 'processing' || existing.status === 'completed')
      )
        return;

      uploadStore.set(trustedId, {
        id: trustedId,
        status: 'processing',
        fileName: uploadInfo.fileName,
        progress: 50,
      });

      setImmediate(async () => {
        try {
          const latestInfo = chunkStore.get(trustedId);
          if (!latestInfo || latestInfo.chunks.size < latestInfo.totalChunks)
            return;

          const finalPath = path.join(tmpDir.name, `${trustedId}-final`);
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

          uploadStore.set(trustedId, {
            id: trustedId,
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

          uploadStore.set(trustedId, {
            id: trustedId,
            status: 'completed',
            key: response,
            fileName: latestInfo.fileName,
            progress: 100,
          });

          setTimeout(() => {
            uploadStore.delete(trustedId);
            chunkStore.delete(trustedId);
          }, 5 * 60 * 1000);

          try {
            fs.unlinkSync(finalPath);
          } catch {
            console.error('Failed to unlink final file:', finalPath);
          }
          try {
            fs.rmSync(chunkDir, { recursive: true, force: true });
          } catch {
            console.error('Failed to remove chunk directory:', chunkDir);
          }
        } catch (err: unknown) {
          console.error('Final merge/upload failed:', err);
          uploadStore.set(trustedId, {
            id: trustedId,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Processing failed',
            fileName: uploadInfo.fileName,
          });
        }
      });
    }

    return null;
  },
);

/**
 * Poll the current status of a chunked upload.
 * Returns progress from chunkStore while chunks are still arriving,
 * then switches to uploadStore once merging/uploading begins.
 */
router.get('/upload-chunked/status/:uploadId', (req, res) => {
  const safeId = String(req.params.uploadId).replaceAll(/[^a-zA-Z0-9-]/g, '');
  const status = uploadStore.get(safeId);

  if (!status) {
    const pending = chunkStore.get(safeId);
    if (pending) {
      return res.json({
        id: safeId,
        status: 'pending',
        progress: Math.round((pending.chunks.size / pending.totalChunks) * 70),
      });
    }
    return res.status(404).json({ error: 'Upload not found' });
  }

  return res.json(status);
});

export { router };

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { z } from 'zod';
import { config } from '~/config';

interface UploadRequest {
  contentType: string;
  size: number;
  expiresIn: number;
}

interface DownloadRequest {
  name: string;
  contentType: string;
  /** Show in the browser (images, PDFs) instead of saving. */
  inline: boolean;
  expiresIn: number;
}

/** Where file bytes live. Keys are made by core (`<org>/<yyyy>/<mm>/<id>`), never by users. */
export interface Storage {
  /** A link the client PUTs the bytes to, and the headers it must send. */
  uploadTarget(
    key: string,
    request: UploadRequest,
  ): Promise<{ url: string; headers: Record<string, string> }>;
  /** The stored object's size, or null when nothing is stored under the key. */
  stat(key: string): Promise<{ size: number } | null>;
  /** A short-lived link to read the object. */
  downloadUrl(key: string, request: DownloadRequest): Promise<string>;
  remove(key: string): Promise<void>;
}

/**
 * Types a browser may show inline. Anything else (HTML, SVG, scripts) is sent
 * as a download, so an uploaded file can never run as a page of erxes.
 */
const INLINE_TYPES =
  /^(image\/(png|jpe?g|gif|webp|avif|bmp)|application\/pdf|video\/(mp4|webm|ogg)|audio\/[a-z0-9.+-]+|text\/plain)$/;

export const canShowInline = (contentType: string) => INLINE_TYPES.test(contentType);

/** `attachment; filename="report.pdf"; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf` */
export const contentDisposition = (name: string, inline: boolean) => {
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');

  return `${inline ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
};

// ─── Local disk ─────────────────────────────────────────────────────────────

/** What a signed local link allows: write (`put`) or read (`get`) one key, until `exp`. */
const LocalGrant = z.object({
  op: z.enum(['put', 'get']),
  key: z.string(),
  exp: z.number(),
  /** put: exact size and type the bytes must have. */
  size: z.number().optional(),
  contentType: z.string().optional(),
  /** get: how to serve them. */
  name: z.string().optional(),
  inline: z.boolean().optional(),
});

type LocalGrant = z.infer<typeof LocalGrant>;

const KEY = /^[A-Za-z0-9]+\/\d{4}\/\d{2}\/[A-Za-z0-9]+$/;

const signingKey = () =>
  createHmac('sha256', config.auth.jwtSecret).update('core-files-v1').digest();

const sign = (payload: string) =>
  createHmac('sha256', signingKey()).update(payload).digest('base64url');

const signGrant = (grant: LocalGrant) => {
  const payload = Buffer.from(JSON.stringify(grant)).toString('base64url');

  return `${payload}.${sign(payload)}`;
};

/** The grant in a signed token, or null if it is forged or expired. */
export const readGrant = (token: string): LocalGrant | null => {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);

  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const grant = LocalGrant.parse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));

    if (grant.exp < Math.floor(Date.now() / 1000) || !KEY.test(grant.key)) {
      return null;
    }

    return grant;
  } catch {
    return null;
  }
};

/** The file on disk for a key, always inside the storage folder. */
export const localPath = (key: string) => {
  if (!KEY.test(key)) {
    throw new Error('invalid storage key');
  }

  const root = resolve(config.files.localDir);
  const path = resolve(root, key);

  if (!path.startsWith(root + sep)) {
    throw new Error('invalid storage key');
  }

  return path;
};

const signedPath = (token: string) => `${CORE_API_PREFIX}/files/signed/${token}`;

const expiry = (seconds: number) => Math.floor(Date.now() / 1000) + seconds;

const localStorage: Storage = {
  async uploadTarget(key, request) {
    await mkdir(dirname(localPath(key)), { recursive: true });

    const token = signGrant({
      op: 'put',
      key,
      exp: expiry(request.expiresIn),
      size: request.size,
      contentType: request.contentType,
    });

    return { url: signedPath(token), headers: { 'Content-Type': request.contentType } };
  },
  async stat(key) {
    try {
      const info = await stat(localPath(key));

      return info.isFile() ? { size: info.size } : null;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;

      throw error;
    }
  },
  async downloadUrl(key, request) {
    return signedPath(
      signGrant({
        op: 'get',
        key,
        exp: expiry(request.expiresIn),
        name: request.name,
        contentType: request.contentType,
        inline: request.inline,
      }),
    );
  },
  async remove(key) {
    await rm(localPath(key), { force: true });
  },
};

// ─── S3-compatible (AWS S3, Cloudflare R2, MinIO) ───────────────────────────

const s3Storage = (): Storage => {
  const { s3 } = config.files;

  const client = new S3Client({
    region: s3.region,
    endpoint: s3.endpoint,
    forcePathStyle: s3.forcePathStyle,
    credentials:
      s3.accessKeyId && s3.secretAccessKey
        ? { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey }
        : undefined,
  });

  return {
    async uploadTarget(key, request) {
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: s3.bucket, Key: key, ContentType: request.contentType }),
        { expiresIn: request.expiresIn, signableHeaders: new Set(['content-type']) },
      );

      return { url, headers: { 'Content-Type': request.contentType } };
    },
    async stat(key) {
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: s3.bucket, Key: key }));

        return { size: head.ContentLength ?? 0 };
      } catch (error) {
        if (
          error instanceof NotFound ||
          (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404)
        ) {
          return null;
        }

        throw error;
      }
    },
    async downloadUrl(key, request) {
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: s3.bucket,
          Key: key,
          ResponseContentType: request.contentType,
          ResponseContentDisposition: contentDisposition(request.name, request.inline),
        }),
        { expiresIn: request.expiresIn },
      );
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: key }));
    },
  };
};

let current: Storage | null = null;

/** The configured driver (FILES_STORAGE). */
export const storage = (): Storage => {
  current ??= config.files.driver === 's3' ? s3Storage() : localStorage;

  return current;
};

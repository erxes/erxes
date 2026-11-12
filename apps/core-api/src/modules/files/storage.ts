import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  link,
  mkdir,
  readdir,
  readFile,
  rm,
  rmdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { config } from '~/config';

export interface UploadRequest {
  contentType: string;
  size: number;
  expiresIn: number;
}

export interface DownloadRequest {
  name: string;
  contentType: string;
  /** Show in the browser (images, PDFs) instead of saving. */
  inline: boolean;
  expiresIn: number;
}

/**
 * Where file bytes live. Keys are made by core, never by users: uploads go to
 * a temporary key (`uploads/<org>/<id>/<nonce>`), and only bytes core has
 * checked are promoted to the file's own key (`<org>/<yyyy>/<mm>/<id>`), which
 * nobody holds an upload link for — so checked bytes can't be replaced.
 */
export interface Storage {
  /** A link the client PUTs the bytes to, and the headers it must send. */
  uploadTarget(
    key: string,
    request: UploadRequest,
  ): Promise<{ url: string; headers: Record<string, string> }>;
  /** The stored object's size (and version tag), or null when nothing is stored under the key. */
  stat(key: string): Promise<{ size: number; etag?: string } | null>;
  /**
   * Moves the object at `from` to `to` — exactly the version `stat` saw (S3:
   * copy if the ETag still matches). Throws if it changed or `to` exists.
   */
  promote(from: string, to: string, seen: { size: number; etag?: string }): Promise<void>;
  /** A short-lived link to read the object. */
  downloadUrl(key: string, request: DownloadRequest): Promise<string>;
  remove(key: string): Promise<void>;
  /** The object's bytes (imports read uploaded files with it; up to the upload limit, so in memory). */
  read(key: string): Promise<Buffer>;
  /** Stores bytes core made itself (export files) under one of core's own keys. */
  write(key: string, body: Buffer, contentType: string): Promise<void>;
  /**
   * Removes leftovers under `uploads/` older than `olderThanMs` (a link used
   * after its file was finished). S3: use a lifecycle rule on `uploads/` instead.
   */
  sweepUploads?(olderThanMs: number): Promise<number>;
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
export interface LocalGrant {
  op: 'put' | 'get';
  key: string;
  exp: number;
  /** put: exact size and type the bytes must have. */
  size?: number;
  contentType?: string;
  /** get: how to serve them. */
  name?: string;
  inline?: boolean;
}

/** A file's own key, or an upload's temporary one. */
const KEY =
  /^([A-Za-z0-9]+\/\d{4}\/\d{2}\/[A-Za-z0-9]+|uploads\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[a-f0-9]+)$/;

const signingKey = () =>
  createHmac('sha256', config.auth.jwtSecret).update('core-files-v1').digest();

const sign = (payload: string) =>
  createHmac('sha256', signingKey()).update(payload).digest('base64url');

export const signGrant = (grant: LocalGrant) => {
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
    const grant = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as LocalGrant;

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

export const signedPath = (token: string) => `${CORE_API_PREFIX}/files/signed/${token}`;

const expiry = (seconds: number) => Math.floor(Date.now() / 1000) + seconds;

const localStorage: Storage = {
  async read(key) {
    return readFile(localPath(key));
  },
  async write(key, body) {
    const path = localPath(key);

    await mkdir(dirname(path), { recursive: true });
    // Never over an existing object (core's keys are unique).
    await writeFile(path, body, { flag: 'wx' });
  },
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
    } catch {
      return null;
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
  async promote(from, to, seen) {
    const source = localPath(from);
    const info = await stat(source);

    if (info.size !== seen.size) throw new Error('the upload changed while it was being checked');

    await mkdir(dirname(localPath(to)), { recursive: true });
    // A hard link never replaces an existing file (EEXIST), then the temporary name goes.
    await link(source, localPath(to));
    await unlink(source);
  },
  async remove(key) {
    await rm(localPath(key), { force: true });
  },
  async sweepUploads(olderThanMs) {
    const root = resolve(config.files.localDir, 'uploads');
    let removed = 0;
    const walk = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

      for (const entry of entries) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(path);
          await rmdir(path).catch(() => undefined);
        } else if (Date.now() - (await stat(path)).mtimeMs > olderThanMs) {
          await rm(path, { force: true });
          removed += 1;
        }
      }
    };

    await walk(root);

    return removed;
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
        // The size is part of the signature: S3 refuses a body of any other length.
        new PutObjectCommand({
          Bucket: s3.bucket,
          Key: key,
          ContentType: request.contentType,
          ContentLength: request.size,
        }),
        {
          expiresIn: request.expiresIn,
          signableHeaders: new Set(['content-type', 'content-length']),
        },
      );

      return { url, headers: { 'Content-Type': request.contentType } };
    },
    async stat(key) {
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: s3.bucket, Key: key }));

        return { size: head.ContentLength ?? 0, etag: head.ETag };
      } catch (error) {
        const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
          ?.httpStatusCode;

        if (status === 404 || (error as { name?: string }).name === 'NotFound') {
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
    async promote(from, to, seen) {
      await client.send(
        new CopyObjectCommand({
          Bucket: s3.bucket,
          Key: to,
          CopySource: `${s3.bucket}/${from.split('/').map(encodeURIComponent).join('/')}`,
          // Exactly the bytes that were checked: a later PUT to the upload link changes the ETag.
          CopySourceIfMatch: seen.etag,
        }),
      );
      await client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: from }));
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: key }));
    },
    async read(key) {
      const object = await client.send(new GetObjectCommand({ Bucket: s3.bucket, Key: key }));

      return Buffer.from(await object.Body!.transformToByteArray());
    },
    async write(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: s3.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          IfNoneMatch: '*',
        }),
      );
    },
  };
};

let current: Storage | null = null;

/** The configured driver (FILES_STORAGE). */
export const storage = (): Storage => {
  current ??= config.files.driver === 's3' ? s3Storage() : localStorage;

  return current;
};

/** Tests swap the driver. */
export const setStorage = (next: Storage | null) => {
  current = next;
};

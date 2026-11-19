import { z } from 'zod';
import { config } from '~/config';
import type { StoredBytes } from './storage';

/**
 * Cloudflare Images and Stream (FILES_STORAGE=cloudflare with
 * CLOUDFLARE_USE_CDN), as erxes 3.x used them: public images served from
 * imagedelivery.net, videos played from Stream. Files reach them from R2
 * (`cloudflareMove.ts`); keys are the image id and the video's HLS address.
 */

/** Cloudflare turned the request down (4xx other than 429): retrying won't help. */
class CloudflareRefused extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const Envelope = z.object({
  success: z.boolean(),
  errors: z.array(z.object({ code: z.number(), message: z.string() })).default([]),
  result: z.unknown(),
});

const describe = (body: z.infer<typeof Envelope> | undefined, status: number) =>
  body?.errors.map((error) => `${error.code} ${error.message}`).join('; ') || `HTTP ${status}`;

/** One call to the account's API; throws CloudflareRefused or, for what may pass on retry, Error. */
const call = async <T extends z.ZodType>(path: string, schema: T, init: RequestInit = {}) => {
  const { apiUrl, accountId, apiToken } = config.files.cloudflare;
  const headers = new Headers(init.headers);

  headers.set('authorization', `Bearer ${apiToken ?? ''}`);

  const response = await fetch(`${apiUrl}/accounts/${accountId}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(60_000),
  });

  const body = Envelope.safeParse(await response.json().catch(() => null)).data;

  if (response.ok && body?.success) return schema.parse(body.result);

  if (response.status >= 400 && response.status < 500 && response.status !== 429) {
    throw new CloudflareRefused(response.status, `Cloudflare: ${describe(body, response.status)}`);
  }

  throw new Error(`Cloudflare: ${describe(body, response.status)}`);
};

/** Removing what is already gone is done. */
const goneIsDone = (error: unknown) => {
  if (!(error instanceof CloudflareRefused && error.status === 404)) throw error;
};

const bytesOf = async (url: string, headers?: Record<string, string>) => {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) });

  if (!response.ok) throw new Error(`Cloudflare: HTTP ${response.status} reading ${url}`);

  return Buffer.from(await response.arrayBuffer());
};

// ─── Images ─────────────────────────────────────────────────────────────────

/** Path segments of an id, encoded one by one (erxes 3.x ids are `<bucket>/<name>`). */
const pathOf = (id: string) => id.split('/').map(encodeURIComponent).join('/');

/** A new file's image id: its file id and name, so a retry finds the same image. */
export const imageIdOf = (fileId: string, name: string) =>
  `${fileId}-${name.replace(/[^A-Za-z0-9._-]/g, '_')}`.slice(0, 200);

/** The public address of an image, resized to `width` pixels when given. */
export const imageAddress = (id: string, width?: number) => {
  const { imagesUrl, accountHash } = config.files.cloudflare;

  return `${imagesUrl}/${accountHash}/${pathOf(id)}/${width ? `w=${width}` : 'public'}`;
};

const ImageResult = z.object({ id: z.string() });

/**
 * Stores the image Cloudflare fetches from `source` under `id`. True once it
 * is there (also when an earlier attempt stored it); false when Cloudflare
 * won't take it (not an image it reads, too large).
 */
export const putImage = async (id: string, source: string) => {
  const form = new FormData();

  form.set('id', id);
  form.set('url', source);
  form.set('requireSignedURLs', 'false');

  try {
    await call('/images/v1', ImageResult, { method: 'POST', body: form });

    return true;
  } catch (error) {
    if (!(error instanceof CloudflareRefused)) throw error;

    // A retry after the image was stored is refused as a duplicate id.
    return call(`/images/v1/${pathOf(id)}`, ImageResult).then(
      () => true,
      (lookup: unknown) => {
        if (lookup instanceof CloudflareRefused) return false;

        throw lookup;
      },
    );
  }
};

export const cloudflareImages: StoredBytes = {
  downloadUrl: (key) => Promise.resolve(imageAddress(key)),
  remove: (key) =>
    call(`/images/v1/${pathOf(key)}`, z.unknown(), { method: 'DELETE' }).then(
      () => undefined,
      goneIsDone,
    ),
  // The original bytes, not a resized variant.
  read: (key) => {
    const { apiUrl, accountId, apiToken } = config.files.cloudflare;

    return bytesOf(`${apiUrl}/accounts/${accountId}/images/v1/${pathOf(key)}/blob`, {
      authorization: `Bearer ${apiToken ?? ''}`,
    });
  },
};

// ─── Stream ─────────────────────────────────────────────────────────────────

const Video = z.object({
  uid: z.string(),
  readyToStream: z.boolean(),
  status: z.object({ state: z.string() }),
  playback: z.object({ hls: z.string() }).optional(),
});

/** A video's HLS address, `https://customer-<code>.cloudflarestream.com/<uid>/manifest/video.m3u8`, up to its uid. */
const STREAM_BASE = /^(https?:\/\/[^/]+\/([A-Za-z0-9]+))\//;

const baseOf = (key: string) => {
  const match = STREAM_BASE.exec(key);

  if (!match?.[1] || !match[2]) throw new Error('not a Cloudflare Stream address');

  return { base: match[1], uid: match[2] };
};

/** The video an earlier attempt started for this file (`creator` is the file id). */
export const videoOf = async (fileId: string) =>
  (await call(`/stream?creator=${encodeURIComponent(fileId)}`, z.array(Video)))[0] ?? null;

/** Stream fetches the video from `source`; it is processed after. */
export const copyVideo = (source: string, fileId: string, name: string) =>
  call('/stream/copy', Video, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: source, creator: fileId, meta: { name } }),
  });

export const video = (uid: string) => call(`/stream/${uid}`, Video);

const Downloads = z.object({ default: z.object({ status: z.string() }) });

/** Turns on the video's MP4 (what `<video>` plays); true once it is ready. */
export const mp4Ready = async (uid: string) =>
  (await call(`/stream/${uid}/downloads`, Downloads, { method: 'POST' })).default.status ===
  'ready';

export const removeVideo = (uid: string) =>
  call(`/stream/${uid}`, z.unknown(), { method: 'DELETE' }).then(() => undefined, goneIsDone);

const mp4Of = (key: string) => `${baseOf(key).base}/downloads/default.mp4`;

export const cloudflareStream: StoredBytes = {
  downloadUrl: (key) => Promise.resolve(mp4Of(key)),
  remove: (key) => removeVideo(baseOf(key).uid),
  read: (key) => bytesOf(mp4Of(key)),
};

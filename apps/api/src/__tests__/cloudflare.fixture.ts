import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { buffer } from 'node:stream/consumers';
import { afterAll, beforeAll } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { setStorage, type Storage } from '~/modules/files/storage';

const CF_TOKEN = 'cf-api-token';
export const BUCKET = 'erxes-saas';

interface FakeVideo {
  uid: string;
  creator: string;
  body: Buffer;
  ready: boolean;
}

/** A text field of a multipart body (the fake only reads its own, simple forms). */
const fieldOf = (body: Buffer, name: string) =>
  new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)\\r\\n`).exec(body.toString())?.[1] ?? '';

const StreamCopy = z.object({ url: z.string(), creator: z.string() });

const json = (res: ServerResponse, status: number, body: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));

const ok = (res: ServerResponse, result: unknown) =>
  json(res, 200, { success: true, errors: [], result });

const refused = (res: ServerResponse, status: number) =>
  json(res, status, {
    success: false,
    errors: [{ code: status, message: 'refused' }],
    result: null,
  });

const fetched = async (url: string) => Buffer.from(await (await fetch(url)).arrayBuffer());

/**
 * One fake for everything Cloudflare: an R2 bucket (stands in for the S3
 * driver through `setStorage`), the Images and Stream APIs, imagedelivery.net
 * and Stream's MP4s. Turns FILES_STORAGE=cloudflare with CLOUDFLARE_USE_CDN on
 * for the file, and back off after it.
 */
export const useCloudflare = () => {
  const r2 = new Map<string, Buffer>();
  const images = new Map<string, Buffer>();
  const videos = new Map<string, FakeVideo>();
  let server: Server | undefined;
  let base = '';
  const saved = structuredClone({ ...config.files });

  const view = (video: FakeVideo) => ({
    uid: video.uid,
    readyToStream: video.ready,
    status: { state: video.ready ? 'ready' : 'inprogress' },
    playback: { hls: `${base}/${video.uid}/manifest/video.m3u8` },
  });

  const api = async (req: IncomingMessage, res: ServerResponse, path: string, body: Buffer) => {
    if (req.headers.authorization !== `Bearer ${CF_TOKEN}`) return refused(res, 401);

    const url = new URL(req.url ?? '/', 'http://fake');

    if (path === '/images/v1' && req.method === 'POST') {
      const id = fieldOf(body, 'id');

      if (images.has(id)) return refused(res, 409);

      const bytes = await fetched(fieldOf(body, 'url'));

      if (bytes.toString().startsWith('not an image')) return refused(res, 415);

      images.set(id, bytes);

      return ok(res, { id });
    }

    const image = /^\/images\/v1\/(.+?)(\/blob)?$/.exec(path);

    if (image?.[1]) {
      const id = decodeURIComponent(image[1]);
      const found = images.get(id);

      if (req.method === 'DELETE') return images.delete(id) ? ok(res, {}) : refused(res, 404);

      if (!found) return refused(res, 404);

      return image[2] ? res.writeHead(200).end(found) : ok(res, { id });
    }

    if (path === '/stream' && req.method === 'GET') {
      const creator = url.searchParams.get('creator');

      return ok(res, [...videos.values()].filter((video) => video.creator === creator).map(view));
    }

    if (path === '/stream/copy') {
      const input = StreamCopy.parse(JSON.parse(body.toString()));

      const video = {
        uid: `v${videos.size + 1}`,
        creator: input.creator,
        body: await fetched(input.url),
        ready: false,
      };

      videos.set(video.uid, video);

      return ok(res, view(video));
    }

    const stream = /^\/stream\/([A-Za-z0-9]+)(\/downloads)?$/.exec(path);
    const video = stream?.[1] ? videos.get(stream[1]) : undefined;

    if (!stream?.[1] || !video) return refused(res, 404);

    if (req.method === 'DELETE') return videos.delete(video.uid) && ok(res, {});

    return stream[2]
      ? ok(res, { default: { status: video.ready ? 'ready' : 'inprogress' } })
      : ok(res, view(video));
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const path = new URL(req.url ?? '/', 'http://fake').pathname;
    const body = await buffer(req);
    const account = '/client/v4/accounts/acct';

    if (path.startsWith(account)) return api(req, res, path.slice(account.length), body);

    if (path.startsWith('/r2/')) {
      const key = decodeURIComponent(path.slice(4));

      if (req.method === 'PUT') return r2.set(key, body) && res.writeHead(200).end();

      const found = r2.get(key);

      return found ? res.writeHead(200).end(found) : res.writeHead(404).end();
    }

    const delivered = /^\/images\/hash\/(.+)\/(public|w=\d+)$/.exec(path);

    if (delivered?.[1]) {
      const found = images.get(decodeURIComponent(delivered[1]));

      return found ? res.writeHead(200).end(found) : res.writeHead(404).end();
    }

    const mp4 = /^\/([A-Za-z0-9]+)\/downloads\/default\.mp4$/.exec(path);
    const video = mp4?.[1] ? videos.get(mp4[1]) : undefined;

    return video?.ready ? res.writeHead(200).end(video.body) : res.writeHead(404).end();
  };

  /** R2 through the S3 driver's interface, kept in `r2`. */
  const bucket: Storage = {
    uploadTarget: (key, request) =>
      Promise.resolve({
        url: `${base}/r2/${key}`,
        headers: { 'Content-Type': request.contentType },
      }),
    stat: (key) => {
      const found = r2.get(key);

      return Promise.resolve(found ? { size: found.length, etag: String(found.length) } : null);
    },
    promote: (from, to) => {
      const found = r2.get(from);

      if (!found || r2.has(to)) return Promise.reject(new Error('not promoted'));

      r2.set(to, found);
      r2.delete(from);

      return Promise.resolve();
    },
    downloadUrl: (key) => Promise.resolve(`${base}/r2/${encodeURIComponent(key)}`),
    remove: (key) => {
      r2.delete(key);

      return Promise.resolve();
    },
    read: (key) => {
      const found = r2.get(key);

      return found ? Promise.resolve(found) : Promise.reject(new Error(`no ${key}`));
    },
    write: (key, body) => {
      r2.set(key, body);

      return Promise.resolve();
    },
  };

  beforeAll(async () => {
    server = createServer((req, res) => {
      handle(req, res).catch(() => res.writeHead(500).end());
    }).listen(0);
    await once(server, 'listening');

    const address = server.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    base = `http://127.0.0.1:${address.port}`;

    Object.assign(config.files, {
      driver: 'cloudflare',
      maxSizeMb: 500,
      cloudflare: {
        ...config.files.cloudflare,
        r2: { ...config.files.cloudflare.r2, bucket: BUCKET },
        useCdn: true,
        accountId: 'acct',
        apiToken: CF_TOKEN,
        accountHash: 'hash',
        apiUrl: `${base}/client/v4`,
        imagesUrl: `${base}/images`,
      },
    });
    setStorage(bucket);
  });

  afterAll(async () => {
    Object.assign(config.files, saved);
    setStorage(null);
    server?.closeAllConnections();
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  });

  return {
    r2,
    images,
    videos,
    /** The fake's address, for what it hands out. */
    base: () => base,
  };
};

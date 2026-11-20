import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { buffer } from 'node:stream/consumers';
import { afterAll, beforeAll } from 'vite-plus/test';

/** The one key the fake takes; its secret isn't checked (signatures aren't). */
export const ACCESS_KEY_ID = 'fake-access-key';

interface StoredObject {
  body: Buffer;
  etag: string;
  contentType: string;
}

const xmlError = (res: ServerResponse, status: number, code: string) =>
  res
    .writeHead(status, { 'content-type': 'application/xml' })
    .end(`<?xml version="1.0"?><Error><Code>${code}</Code><Message>${code}</Message></Error>`);

/** An aws-chunked body (`<hex size>\r\n<bytes>\r\n` … `0\r\n<trailers>`), as the SDK sends with a checksum trailer. */
const unchunked = (body: Buffer) => {
  const parts: Buffer[] = [];
  let at = 0;

  for (;;) {
    const end = body.indexOf('\r\n', at);
    const size = Number.parseInt(body.subarray(at, end).toString().split(';')[0] ?? '0', 16);

    if (!size) return Buffer.concat(parts);

    parts.push(body.subarray(end + 2, end + 2 + size));
    at = end + 2 + size + 2;
  }
};

const isChunked = (req: IncomingMessage) =>
  (req.headers['content-encoding'] ?? '').includes('aws-chunked') ||
  String(req.headers['x-amz-content-sha256'] ?? '').startsWith('STREAMING-');

const keyOf = (req: IncomingMessage) => {
  const url = new URL(req.url ?? '/', 'http://fake');

  return {
    url,
    credential: req.headers.authorization ?? url.searchParams.get('X-Amz-Credential') ?? '',
    path: url.pathname.split('/').slice(1).map(decodeURIComponent),
  };
};

/**
 * A path-style S3 API (MinIO-like) with two buckets, `erxes-files` and
 * `other-files`: the objects core's S3 driver puts, heads, copies, gets and
 * deletes, by plain requests and presigned links.
 */
export const useFakeS3 = () => {
  const buckets = new Map([
    ['erxes-files', new Map<string, StoredObject>()],
    ['other-files', new Map<string, StoredObject>()],
  ]);

  let server: Server | undefined;
  let endpoint = '';
  let version = 0;

  const store = (
    objects: Map<string, StoredObject>,
    key: string,
    body: Buffer,
    contentType: string,
  ) => {
    version += 1;
    const etag = `"v${version}"`;

    objects.set(key, { body, etag, contentType });

    return etag;
  };

  const copy = (
    res: ServerResponse,
    req: IncomingMessage,
    objects: Map<string, StoredObject>,
    key: string,
  ) => {
    const [from = '', ...rest] = decodeURIComponent(String(req.headers['x-amz-copy-source'])).split(
      '/',
    );

    const source = buckets.get(from)?.get(rest.join('/'));

    if (!source) return xmlError(res, 404, 'NoSuchKey');

    if (req.headers['x-amz-copy-source-if-match'] !== source.etag)
      return xmlError(res, 412, 'PreconditionFailed');

    const etag = store(objects, key, source.body, source.contentType);

    return res
      .writeHead(200, { 'content-type': 'application/xml' })
      .end(
        `<CopyObjectResult><ETag>${etag}</ETag><LastModified>${new Date().toISOString()}</LastModified></CopyObjectResult>`,
      );
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const raw = await buffer(req);
    const { credential, path } = keyOf(req);
    const [bucketName = '', ...rest] = path;
    const key = rest.join('/');
    const objects = buckets.get(bucketName);

    if (!credential.includes(`${ACCESS_KEY_ID}/`)) return xmlError(res, 403, 'InvalidAccessKeyId');

    if (!objects) return xmlError(res, 404, 'NoSuchBucket');

    const found = objects.get(key);

    if (req.method === 'PUT' && req.headers['x-amz-copy-source'])
      return copy(res, req, objects, key);

    if (req.method === 'PUT') {
      if (req.headers['if-none-match'] === '*' && found)
        return xmlError(res, 412, 'PreconditionFailed');

      const etag = store(
        objects,
        key,
        isChunked(req) ? unchunked(raw) : raw,
        req.headers['content-type'] ?? '',
      );

      return res.writeHead(200, { etag }).end();
    }

    if (req.method === 'DELETE') {
      objects.delete(key);

      return res.writeHead(204).end();
    }

    if (!found)
      return req.method === 'HEAD' ? res.writeHead(404).end() : xmlError(res, 404, 'NoSuchKey');

    res.writeHead(200, {
      'content-length': found.body.length,
      'content-type': found.contentType,
      etag: found.etag,
    });

    return res.end(req.method === 'HEAD' ? undefined : found.body);
  };

  beforeAll(async () => {
    server = createServer((req, res) => {
      handle(req, res).catch(() => res.writeHead(500).end());
    }).listen(0);
    await once(server, 'listening');

    const address = server.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    endpoint = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    server?.closeAllConnections();
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  });

  return {
    buckets,
    /** The fake's address, for the bucket settings. */
    endpoint: () => endpoint,
  };
};

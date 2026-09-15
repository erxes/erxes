import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { createServer } from 'node:http';
import { isolateViberModules } from '../../__tests__/moduleHarness';
import type { TestContext } from '../../__tests__/helperHarness';

const setup = (t: TestContext, address = 'http://core.example.test:3300') => {
  isolateViberModules(
    t,
    {
      'erxes-api-shared/utils': {
        getPlugin: async (name: string) => {
          strictEqual(name, 'core');
          return { address };
        },
      },
    },
    ['@/integrations/viber/utils/storage'],
  );
  const storage: typeof import('../storage') = require('../storage');
  return storage;
};

test('uses the discovered Core read-file route and encoded keys, independently of the webhook tunnel', async (t) => {
  const storage = setup(t);
  strictEqual(
    await storage.getViberStoredFileUrl('tenant-a', 'bucket/my photo.png'),
    'http://core.example.test:3300/read-file?key=bucket%2Fmy+photo.png',
  );
  strictEqual(
    await storage.getViberStoredFileUrl('tenant-b', 'report.pdf'),
    'http://core.example.test:3300/read-file?key=report.pdf',
  );
});

test('never fetches remote URLs, traversal keys, or malformed file-service configuration', async (t) => {
  const storage = setup(t);
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('unused'),
  );
  for (const key of [
    '',
    'https://evil.example/a',
    '//host/a',
    '../a',
    'x/../a',
    '/a',
    'x%2fa',
    'x?a',
    'x#y',
    'x\\y',
    'x\ny',
  ]) {
    await rejects(storage.readViberStoredFile('test', key));
  }
  await rejects(storage.readViberStoredFile('', 'file.pdf'));
  strictEqual(fetch.mock.callCount(), 0);
  for (const address of [
    '',
    'file:///etc',
    'https://user:pass@example.test',
    'https://example.test?x=1',
    'https://example.test/#x',
  ]) {
    await t.test(address || 'empty address', async (t) => {
      const invalid = setup(t, address);
      await rejects(invalid.readViberStoredFile('test', 'file.pdf'));
    });
  }
  strictEqual(fetch.mock.callCount(), 0);
});

test('reads image/file bytes from Core with a deadline, no redirects and no forwarded secrets', async (t) => {
  const storage = setup(t);
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    strictEqual(url, 'http://core.example.test:3300/read-file?key=photo.png');
    strictEqual(init?.redirect, 'error');
    ok(init?.signal instanceof AbortSignal);
    deepStrictEqual(init?.headers, { 'nginx-hostname': 'test' });
    return new Response('transformed image', {
      headers: { 'Content-Type': 'image/png' },
    });
  });
  deepStrictEqual(
    await storage.readViberStoredFile('test', 'photo.png'),
    Buffer.from('transformed image'),
  );
});

test('rejects HTTP failures, empty files and oversized declared or streamed content', async (t) => {
  const storage = setup(t);
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('failed', { status: 404 }),
  );
  await rejects(storage.readViberStoredFile('test', 'report.pdf'), /HTTP 404/);
  fetch.mock.mockImplementation(async () => new Response(''));
  await rejects(storage.readViberStoredFile('test', 'report.pdf'), /empty/);
  fetch.mock.mockImplementation(
    async () =>
      new Response('small', {
        headers: { 'Content-Length': String(50 * 1024 * 1024 + 1) },
      }),
  );
  await rejects(storage.readViberStoredFile('test', 'report.pdf'), /50 MiB/);
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(50 * 1024 * 1024 + 1));
    },
    cancel() {
      cancelled = true;
    },
  });
  fetch.mock.mockImplementation(
    async () => new Response(body, { headers: { 'Content-Length': '1' } }),
  );
  await rejects(storage.readViberStoredFile('test', 'report.pdf'), /50 MiB/);
  strictEqual(cancelled, true);
  strictEqual(body.locked, false);
  fetch.mock.mockImplementation(async () => {
    throw new Error('connection failed');
  });
  await rejects(
    storage.readViberStoredFile('test', 'report.pdf'),
    /connection failed/,
  );
});

test('real HTTP reads go only to Core, and redirect destinations are never contacted', async (t) => {
  const requests: string[] = [];
  const server = createServer((req, res) => {
    strictEqual(req.headers['nginx-hostname'], 'test');
    requests.push(req.url ?? '');
    if (req.url?.includes('redirect.pdf')) {
      res.writeHead(302, { Location: '/not-allowed' }).end();
    } else {
      res.setHeader('Content-Type', 'image/png');
      res.end('core image');
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing test port');
  const storage = setup(t, `http://127.0.0.1:${address.port}`);
  deepStrictEqual(
    await storage.readViberStoredFile('test', 'photo.png'),
    Buffer.from('core image'),
  );
  await rejects(storage.readViberStoredFile('test', 'redirect.pdf'));
  deepStrictEqual(requests, [
    '/read-file?key=photo.png',
    '/read-file?key=redirect.pdf',
  ]);
});

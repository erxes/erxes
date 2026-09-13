import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { Module } from 'node:module';
import express, { type Response } from 'express';
import type { IViberWebhookRequest } from '../@types/webhook';

type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];

const createRouteHarness = async (t: TestContext) => {
  const app = express();
  const server = createServer(app);
  const logError = t.mock.method(console, 'error', () => undefined);
  const receive = t.mock.fn(
    async (
      req: IViberWebhookRequest,
      res: Response<unknown>,
    ): Promise<void> => {
      strictEqual(req.method, 'POST');
      res.sendStatus(200);
    },
  );
  const receiverPath = require.resolve('../controller/receiveMessage');
  const routerPath = require.resolve('../routes');
  const debuggerPath = require.resolve('../debuggers');
  const originalModules = new Map<string, NodeModule | undefined>();

  for (const filename of [receiverPath, routerPath, debuggerPath]) {
    originalModules.set(filename, require.cache[filename]);
  }

  t.after(async () => {
    try {
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeAllConnections();
        });
      }
    } finally {
      for (const [filename, original] of originalModules) {
        if (original) {
          require.cache[filename] = original;
        } else {
          delete require.cache[filename];
        }
      }
    }
  });

  // Isolate the controller before loading the real router and logger.
  const receiverModule = new Module(receiverPath);
  receiverModule.filename = receiverPath;
  receiverModule.loaded = true;
  receiverModule.exports = { receiveViberMessage: receive };
  require.cache[receiverPath] = receiverModule;
  delete require.cache[routerPath];
  delete require.cache[debuggerPath];
  const { router }: typeof import('../routes') = require('../routes');

  // Mirror the existing raw-byte capture without starting the shared bootstrap.
  app.use(
    express.json({
      verify(req, _res, rawBody) {
        Object.assign(req, { rawBody });
      },
    }),
  );
  app.use('/viber', router);

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('The test server did not bind to a TCP port');
  }

  const request = (
    path = '/viber/receive/inbox-route-test',
    options: { method?: 'GET' | 'POST'; body?: string } = {},
  ) =>
    fetch(`http://127.0.0.1:${address.port}${path}`, {
      method: options.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Viber-Content-Signature': 'signature-route-test',
      },
      body:
        options.method === 'GET'
          ? undefined
          : options.body ?? '{"event":"webhook"}',
      signal: AbortSignal.timeout(5000),
    });

  return { request, receive, logError };
};

test('the POST route forwards the inbox path parameter, signature, and exact raw bytes', async (t) => {
  const { request, receive, logError } = await createRouteHarness(t);
  const rawBody =
    '{ "event": "message", "message_token": 4912661846655238145 }';
  receive.mock.mockImplementation(async (req, res) => {
    strictEqual(req.params.integrationId, 'inbox-route-test');
    strictEqual(
      req.header('X-Viber-Content-Signature'),
      'signature-route-test',
    );
    deepStrictEqual(req.rawBody, Buffer.from(rawBody));
    res.sendStatus(200);
  });

  const response = await request(
    '/viber/receive/inbox-route-test?integrationId=ignored',
    {
      body: rawBody,
    },
  );

  strictEqual(response.status, 200);
  strictEqual(await response.text(), 'OK');
  strictEqual(receive.mock.callCount(), 1);
  strictEqual(logError.mock.callCount(), 0);
});

test('the router preserves responses already handled by the receiver', async (t) => {
  const { request, receive, logError } = await createRouteHarness(t);

  for (const status of [400, 401, 404, 500, 501]) {
    receive.mock.mockImplementation(async (_req, res) => {
      res.status(status).json({ error: 'Controlled receiver response' });
    });

    const response = await request();

    strictEqual(response.status, status);
    deepStrictEqual(await response.json(), {
      error: 'Controlled receiver response',
    });
  }

  strictEqual(receive.mock.callCount(), 5);
  strictEqual(logError.mock.callCount(), 0);
});

test('synchronous throws and asynchronous rejections become a safe 500 and fixed log entry', async (t) => {
  const { request, receive, logError } = await createRouteHarness(t);
  const failures = [
    () => {
      throw new Error('Sensitive synchronous failure: test-token');
    },
    async () => {
      throw new Error('Sensitive asynchronous failure: test-token');
    },
  ];

  for (const failure of failures) {
    receive.mock.mockImplementation(failure);
    const response = await request();

    strictEqual(response.status, 500);
    deepStrictEqual(await response.json(), {
      error: 'Failed to handle Viber webhook',
    });
    deepStrictEqual(logError.mock.calls.at(-1)?.arguments, [
      '[viber:error]',
      'Failed to handle Viber webhook',
    ]);
  }

  strictEqual(receive.mock.callCount(), 2);
  strictEqual(logError.mock.callCount(), 2);
});

test('an error after a completed response is logged without attempting a second response', async (t) => {
  const { request, receive, logError } = await createRouteHarness(t);
  receive.mock.mockImplementation(async (_req, res) => {
    res.status(202).json({ accepted: true });
    throw new Error('Sensitive failure after responding: test-token');
  });

  const response = await request();

  strictEqual(response.status, 202);
  deepStrictEqual(await response.json(), { accepted: true });
  strictEqual(receive.mock.callCount(), 1);
  strictEqual(logError.mock.callCount(), 1);
  deepStrictEqual(logError.mock.calls[0].arguments, [
    '[viber:error]',
    'Failed to handle Viber webhook',
  ]);
});

test('GET requests and POST requests missing the inbox id do not reach the receiver', async (t) => {
  const { request, receive, logError } = await createRouteHarness(t);
  const getResponse = await request('/viber/receive/inbox-route-test', {
    method: 'GET',
  });
  strictEqual(getResponse.status, 404);
  await getResponse.text();

  const missingIdResponse = await request('/viber/receive');
  strictEqual(missingIdResponse.status, 404);
  await missingIdResponse.text();

  strictEqual(receive.mock.callCount(), 0);
  strictEqual(logError.mock.callCount(), 0);
});

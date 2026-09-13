import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { createHmac } from 'node:crypto';
import { Module } from 'node:module';
import type { Response } from 'express';
import type { IViberWebhookRequest } from '../../@types/webhook';

const TEST_TOKEN = 'test-viber-token';

// The installed Node types do not export the callback context by name.
type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];

const createReceiverHarness = (
  t: TestContext,
  integration: { token: string } | null = { token: TEST_TOKEN },
) => {
  const select = t.mock.fn(async (projection: string) => {
    strictEqual(projection, '+token');
    return integration;
  });
  const findOne = t.mock.fn((query: { inboxId: string }) => {
    deepStrictEqual(query, { inboxId: 'inbox-test' });
    return { select };
  });
  const generateModels = t.mock.fn(async (subdomain: string) => {
    strictEqual(subdomain, 'test');
    return { ViberIntegrations: { findOne } };
  });

  // Replace only the two infrastructure imports before loading the controller.
  // Keep the real signature verifier and JSON parser, and restore every entry.
  const originalModules = new Map<string, NodeModule | undefined>();
  t.after(() => {
    for (const [filename, original] of originalModules) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
  });

  const mockModule = (specifier: string, exports: Record<string, unknown>) => {
    const filename = require.resolve(specifier);
    originalModules.set(filename, require.cache[filename]);
    const replacement = new Module(filename);
    replacement.filename = filename;
    replacement.loaded = true;
    replacement.exports = exports;
    require.cache[filename] = replacement;
  };

  mockModule('erxes-api-shared/utils', { getSubdomain: () => 'test' });
  mockModule('~/connectionResolvers', { generateModels });

  const receiverPath = require.resolve('../receiveMessage');
  originalModules.set(receiverPath, require.cache[receiverPath]);
  delete require.cache[receiverPath];
  const {
    receiveViberMessage,
  }: typeof import('../receiveMessage') = require('../receiveMessage');

  const receive = async (
    body?: string,
    options: { signature?: string | null; parsedBody?: unknown } = {},
  ) => {
    const rawBody = body === undefined ? undefined : Buffer.from(body);
    const signature =
      options.signature === undefined && rawBody
        ? createHmac('sha256', TEST_TOKEN).update(rawBody).digest('hex')
        : options.signature ?? undefined;
    const request = {
      rawBody,
      body: options.parsedBody,
      params: { integrationId: 'inbox-test' },
      header(name: string) {
        strictEqual(name, 'X-Viber-Content-Signature');
        return signature;
      },
    };
    let statusCode = 200;
    const replies: Array<{ statusCode: number; body?: unknown }> = [];
    const response = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        replies.push({ statusCode, body: payload });
        return this;
      },
      sendStatus(code: number) {
        replies.push({ statusCode: code });
        return this;
      },
    };

    // These doubles provide only the Express members used by this controller.
    await receiveViberMessage(
      request as IViberWebhookRequest,
      response as Response<unknown>,
    );
    return replies;
  };

  return { receive, generateModels, findOne, select };
};

test('rejects a missing raw body before looking up tenant models', async (t) => {
  const { receive, generateModels } = createReceiverHarness(t);

  deepStrictEqual(await receive(), [
    { statusCode: 400, body: { error: 'Invalid viber request body' } },
  ]);
  strictEqual(generateModels.mock.callCount(), 0);
});

test('loads the integration from the request tenant and explicitly selects its token', async (t) => {
  const { receive, generateModels, findOne, select } = createReceiverHarness(t);

  deepStrictEqual(await receive('{"event":"webhook"}'), [{ statusCode: 200 }]);
  strictEqual(generateModels.mock.callCount(), 1);
  strictEqual(findOne.mock.callCount(), 1);
  strictEqual(select.mock.callCount(), 1);
});

test('rejects a request for an unknown Viber integration', async (t) => {
  const { receive } = createReceiverHarness(t, null);

  deepStrictEqual(await receive('{"event":"webhook"}'), [
    { statusCode: 404, body: { error: 'Viber integration not found' } },
  ]);
});

test('rejects missing and incorrect signatures', async (t) => {
  const { receive } = createReceiverHarness(t);

  for (const signature of [null, '', 'invalid', '0'.repeat(64)]) {
    deepStrictEqual(await receive('{"event":"webhook"}', { signature }), [
      { statusCode: 401, body: { error: 'Invalid Viber signature' } },
    ]);
  }
});

test('checks the signature before attempting to parse malformed JSON', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(await receive('not-json', { signature: '0'.repeat(64) }), [
    { statusCode: 401, body: { error: 'Invalid Viber signature' } },
  ]);
});

test('checks the signature before rejecting a malformed message token', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(
    await receive('{"event":"message","message_token":"invalid"}', {
      signature: '0'.repeat(64),
    }),
    [{ statusCode: 401, body: { error: 'Invalid Viber signature' } }],
  );
});

test('returns a safe 400 response for signed malformed JSON', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(await receive('{"event":'), [
    { statusCode: 400, body: { error: 'Invalid Viber webhook payload' } },
  ]);
});

test('rejects signed payloads without a valid event', async (t) => {
  const { receive } = createReceiverHarness(t);

  for (const body of [
    'null',
    '[]',
    '42',
    '{}',
    '{"event":null}',
    '{"event":" "}',
  ]) {
    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber webhook payload' } },
    ]);
  }
});

test('acknowledges a webhook check without requiring a message token or sender', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(await receive('{"event":"webhook"}'), [{ statusCode: 200 }]);
});

test('rejects a message without a message token before checking the sender', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(await receive('{"event":"message"}'), [
    { statusCode: 400, body: { error: 'Invalid Viber message token' } },
  ]);
});

test('rejects non-string and non-decimal message tokens', async (t) => {
  const { receive } = createReceiverHarness(t);
  const tokenLiterals = [
    'null',
    'false',
    '{}',
    '[]',
    '""',
    '" "',
    '"abc"',
    '"123abc"',
    '" 123"',
    '"123 "',
    '"123\\n"',
    '"123\\r\\n"',
    '"123\\u0000"',
    '"\\u0661\\u0662\\u0663"',
    '"-1"',
    '"1.5"',
    '"1e3"',
    '-1',
    '1.5',
    '1e3',
    '123.0',
  ];

  for (const token of tokenLiterals) {
    deepStrictEqual(
      await receive(`{"event":"message","message_token":${token}}`),
      [{ statusCode: 400, body: { error: 'Invalid Viber message token' } }],
      `Expected token ${token} to be rejected`,
    );
  }
});

test('continues to sender validation for numeric and string decimal message tokens', async (t) => {
  const { receive } = createReceiverHarness(t);
  const tokenLiterals = [
    '4912661846655238145',
    '4912661846655238146',
    '"4912661846655238145"',
    '42',
    '0',
    '"000123"',
  ];

  for (const token of tokenLiterals) {
    // An absent sender proves the token passed its guard without exercising
    // the unfinished message-persistence path.
    deepStrictEqual(
      await receive(`{"event":"message","message_token":${token}}`),
      [{ statusCode: 400, body: { error: 'Invalid Viber message sender' } }],
    );
  }
});

test('uses the signed raw body instead of an already parsed request body', async (t) => {
  const { receive } = createReceiverHarness(t);

  deepStrictEqual(
    await receive('{"event":"message","message_token":"invalid"}', {
      parsedBody: { event: 'webhook' },
    }),
    [{ statusCode: 400, body: { error: 'Invalid Viber message token' } }],
  );
});

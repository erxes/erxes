import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { createHmac } from 'node:crypto';
import { Module } from 'node:module';
import type { Response } from 'express';
import type { IViberWebhookRequest } from '../../@types/webhook';

const TEST_TOKEN = 'test-viber-token';
const TEXT_MESSAGE = {
  event: 'message',
  message_token: '4912661846655238145',
  sender: { id: 'viber-user-test', name: 'Chingun' },
  message: { type: 'text', text: 'Hello <team>\nСайн уу 👋' },
};
const URL_MESSAGE = {
  ...TEXT_MESSAGE,
  message: { type: 'url', media: 'https://example.com/shared-page' },
};
const LOCATION_MESSAGE = {
  ...TEXT_MESSAGE,
  message: { type: 'location', location: { lat: 47.9, lon: 106.9 } },
};
const CONTACT_MESSAGE = {
  ...TEXT_MESSAGE,
  message: {
    type: 'contact',
    contact: {
      name: 'Shared <friend> & family',
      phone_number: '+1 202-555-0100',
      avatar: 'https://example.com/contact-avatar.jpg',
    },
  },
};

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
    return {
      ViberIntegrations: { findOne },
      ViberSubscriptions: { updateOne: async () => ({ matchedCount: 1 }) },
      ViberReceipts: { updateOne: async () => ({ matchedCount: 1 }) },
      ViberOutbox: { findOne: async () => null },
    };
  });
  const processMessage = t.mock.fn(
    async (subdomain: string, input: unknown) => {
      strictEqual(subdomain, 'test');
      strictEqual(typeof input, 'object');
      return 'frontline-message-test';
    },
  );
  const respond = t.mock.fn(
    (reply: { statusCode: number; body?: unknown }) => reply,
  );

  // Replace infrastructure and processing imports before loading the controller.
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

  mockModule('erxes-api-shared/utils', {
    getSubdomain: () => 'test',
    getEnv: () => 'media.example.com',
  });
  mockModule('@/inbox/graphql/resolvers/mutations/widget', {
    pConversationClientMessageInserted: async () => undefined,
  });
  mockModule('~/connectionResolvers', { generateModels });
  mockModule('@/integrations/viber/helpers', {
    processViberMessage: processMessage,
  });

  for (const specifier of [
    '@/integrations/viber/events',
    '@/integrations/viber/config',
  ]) {
    const filename = require.resolve(specifier);
    originalModules.set(filename, require.cache[filename]);
    delete require.cache[filename];
  }

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
        replies.push(respond({ statusCode, body: payload }));
        return this;
      },
      sendStatus(code: number) {
        replies.push(respond({ statusCode: code }));
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

  return { receive, generateModels, findOne, select, processMessage, respond };
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

test('allows absent or string sender names to reach message validation', async (t) => {
  const { receive } = createReceiverHarness(t);

  for (const name of [undefined, '', '   ', '  Чингүн 👋  ']) {
    const body = JSON.stringify({
      event: 'message',
      message_token: '4912661846655238145',
      sender: { id: 'sender-test', name },
    });

    // Deliberately omit the message to stop before the unfinished write path.
    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber message payload' } },
    ]);
  }
});

test('rejects a present non-string sender name before message validation', async (t) => {
  const { receive } = createReceiverHarness(t);

  for (const name of [null, 42, false, [], {}]) {
    const body = JSON.stringify({
      event: 'message',
      message_token: '4912661846655238145',
      sender: { id: 'sender-test', name },
    });

    deepStrictEqual(
      await receive(body),
      [{ statusCode: 400, body: { error: 'Invalid Viber sender name' } }],
      `Expected sender name ${JSON.stringify(name)} to be rejected`,
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

test('passes validated text and exact identity fields to processing before acknowledging', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  deepStrictEqual(await receive(JSON.stringify(TEXT_MESSAGE)), [
    { statusCode: 200 },
  ]);
  strictEqual(processMessage.mock.callCount(), 1);
  deepStrictEqual(processMessage.mock.calls[0].arguments, [
    'test',
    {
      inboxId: 'inbox-test',
      userId: TEXT_MESSAGE.sender.id,
      messageToken: TEXT_MESSAGE.message_token,
      text: TEXT_MESSAGE.message.text,
      name: TEXT_MESSAGE.sender.name,
    },
  ]);
});

test('invalid text is rejected without invoking message processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const text of ['', '   ', 42]) {
    const body = JSON.stringify({
      ...TEXT_MESSAGE,
      message: { type: 'text', text },
    });
    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber text message' } },
    ]);
  }
  strictEqual(processMessage.mock.callCount(), 0);
});

test('a text-processing failure returns a safe 500 response instead of acknowledging', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  processMessage.mock.mockImplementation(async () => {
    throw new Error('Sensitive internal failure');
  });

  deepStrictEqual(await receive(JSON.stringify(TEXT_MESSAGE)), [
    { statusCode: 500, body: { error: 'Failed to process Viber message' } },
  ]);
  strictEqual(processMessage.mock.callCount(), 1);
});

test('passes HTTP and HTTPS links as exact text without fetching or requesting an attachment', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const fetchMedia = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('URL messages must not fetch the linked site');
  });

  for (const media of [
    'http://example.com/shared-page',
    'https://example.com/a%2Fb?first=1&next=%22%3Ctag%3E#part',
  ]) {
    const body = JSON.stringify({
      ...URL_MESSAGE,
      message: { type: 'url', media, text: 'Do not replace the shared URL' },
    });

    deepStrictEqual(await receive(body), [{ statusCode: 200 }]);
    deepStrictEqual(processMessage.mock.calls.at(-1)?.arguments, [
      'test',
      {
        inboxId: 'inbox-test',
        userId: URL_MESSAGE.sender.id,
        messageToken: URL_MESSAGE.message_token,
        text: media,
        name: URL_MESSAGE.sender.name,
      },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 2);
  strictEqual(fetchMedia.mock.callCount(), 0);
});

test('rejects missing, blank, and non-string URL media without processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const media of [undefined, '', '   ', null, 42, false, {}, []]) {
    const body = JSON.stringify({
      ...URL_MESSAGE,
      message: { type: 'url', media },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber media message' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects malformed URL messages without processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const media of ['not a URL', '/relative-path', 'https://']) {
    const body = JSON.stringify({
      ...URL_MESSAGE,
      message: { type: 'url', media },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber media URL' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects URL messages using protocols other than HTTP or HTTPS', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const media of [
    'javascript:alert(1)',
    'data:text/plain,hello',
    'file:///private/example.txt',
    'ftp://example.com/file.txt',
  ]) {
    const body = JSON.stringify({
      ...URL_MESSAGE,
      message: { type: 'url', media },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Unsupported media URL protocol' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('a URL-processing failure returns a safe 500 response instead of acknowledging', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  processMessage.mock.mockImplementation(async () => {
    throw new Error('Sensitive internal failure');
  });

  deepStrictEqual(await receive(JSON.stringify(URL_MESSAGE)), [
    { statusCode: 500, body: { error: 'Failed to process Viber message' } },
  ]);
  strictEqual(processMessage.mock.callCount(), 1);
});

test('processes valid locations including zero and coordinate boundaries as readable text', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const locations = [
    LOCATION_MESSAGE.message.location,
    { lat: 0, lon: 0 },
    { lat: -90, lon: -180 },
    { lat: 90, lon: 180 },
  ];

  for (const location of locations) {
    const body = JSON.stringify({
      ...LOCATION_MESSAGE,
      message: { type: 'location', location },
    });

    deepStrictEqual(await receive(body), [{ statusCode: 200 }]);
    deepStrictEqual(processMessage.mock.calls.at(-1)?.arguments, [
      'test',
      {
        inboxId: 'inbox-test',
        userId: LOCATION_MESSAGE.sender.id,
        messageToken: LOCATION_MESSAGE.message_token,
        text: `Location\nLatitude: ${location.lat}\nLongitude: ${location.lon}`,
        name: LOCATION_MESSAGE.sender.name,
      },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), locations.length);
});

test('rejects missing and non-object locations before processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const location of [undefined, null, [], '47.9,106.9', 42, false]) {
    const body = JSON.stringify({
      ...LOCATION_MESSAGE,
      message: { type: 'location', location },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber location message' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects invalid or out-of-range location coordinates before processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const invalidCoordinates = [undefined, null, '0', false, {}, []];
  const locations = [
    ...invalidCoordinates.map((lat) => ({ lat, lon: 0 })),
    ...invalidCoordinates.map((lon) => ({ lat: 0, lon })),
    { lat: -90.001, lon: 0 },
    { lat: 90.001, lon: 0 },
    { lat: 0, lon: -180.001 },
    { lat: 0, lon: 180.001 },
  ];

  for (const location of locations) {
    const body = JSON.stringify({
      ...LOCATION_MESSAGE,
      message: { type: 'location', location },
    });

    deepStrictEqual(await receive(body), [
      {
        statusCode: 400,
        body: { error: 'Invalid Viber location coordinates' },
      },
    ]);
  }

  // Exponent overflow is valid JSON but produces a non-finite JS number.
  for (const location of ['{"lat":1e400,"lon":0}', '{"lat":0,"lon":-1e400}']) {
    const body = `{"event":"message","message_token":"42","sender":{"id":"sender-test"},"message":{"type":"location","location":${location}}}`;

    deepStrictEqual(await receive(body), [
      {
        statusCode: 400,
        body: { error: 'Invalid Viber location coordinates' },
      },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('renders shared-contact details without replacing sender identity or fetching an avatar', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const fetchAvatar = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Shared contacts must not fetch an avatar');
  });
  const cases = [
    {
      name: CONTACT_MESSAGE.message.contact.name,
      label: 'Contact: Shared <friend> & family',
    },
    { name: undefined, label: 'Contact' },
    { name: '', label: 'Contact' },
    { name: ' \t ', label: 'Contact' },
    { name: '  Найз 👋  ', label: 'Contact:   Найз 👋  ' },
    { name: 'x'.repeat(128), label: `Contact: ${'x'.repeat(128)}` },
  ];
  const phoneNumber = ' +1 202-555-0100 ';

  for (const { name, label } of cases) {
    const body = JSON.stringify({
      ...CONTACT_MESSAGE,
      message: {
        type: 'contact',
        contact: {
          ...CONTACT_MESSAGE.message.contact,
          name,
          phone_number: phoneNumber,
        },
      },
    });

    deepStrictEqual(await receive(body), [{ statusCode: 200 }]);
    deepStrictEqual(processMessage.mock.calls.at(-1)?.arguments, [
      'test',
      {
        inboxId: 'inbox-test',
        userId: CONTACT_MESSAGE.sender.id,
        messageToken: CONTACT_MESSAGE.message_token,
        text: `${label}\nPhone: ${phoneNumber}`,
        name: CONTACT_MESSAGE.sender.name,
      },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), cases.length);
  strictEqual(fetchAvatar.mock.callCount(), 0);
});

test('rejects missing and non-object shared contacts before processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const contact of [undefined, null, [], 'friend', 42, false]) {
    const body = JSON.stringify({
      ...CONTACT_MESSAGE,
      message: { type: 'contact', contact },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber contact message' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects shared contacts with missing, blank, or non-string phone numbers', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const phoneNumber of [undefined, null, '', ' \t ', 42, false, {}, []]) {
    const body = JSON.stringify({
      ...CONTACT_MESSAGE,
      message: {
        type: 'contact',
        contact: {
          ...CONTACT_MESSAGE.message.contact,
          phone_number: phoneNumber,
        },
      },
    });

    deepStrictEqual(await receive(body), [
      {
        statusCode: 400,
        body: { error: 'Invalid Viber contact phone number' },
      },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects non-string or overlong shared-contact names before processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const name of [null, 42, false, {}, [], 'x'.repeat(129)]) {
    const body = JSON.stringify({
      ...CONTACT_MESSAGE,
      message: {
        type: 'contact',
        contact: { ...CONTACT_MESSAGE.message.contact, name },
      },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber contact name' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('contact and location processing failures return a safe 500 without acknowledging', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  processMessage.mock.mockImplementation(async () => {
    throw new Error('Sensitive internal failure');
  });

  for (const message of [CONTACT_MESSAGE, LOCATION_MESSAGE]) {
    deepStrictEqual(await receive(JSON.stringify(message)), [
      { statusCode: 500, body: { error: 'Failed to process Viber message' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 2);
});

for (const message of [URL_MESSAGE, LOCATION_MESSAGE, CONTACT_MESSAGE]) {
  test(
    `does not respond while ${message.message.type}-message processing is still pending`,
    { timeout: 5000 },
    async (t) => {
      const { receive, processMessage, respond } = createReceiverHarness(t);
      let finishProcessing: (messageId: string) => void = () => {
        throw new Error('Processing promise was not initialized');
      };
      let markProcessingStarted: () => void = () => {
        throw new Error('Processing-start promise was not initialized');
      };
      const processingResult = new Promise<string>((resolve) => {
        finishProcessing = resolve;
      });
      const processingStarted = new Promise<void>((resolve) => {
        markProcessingStarted = resolve;
      });
      processMessage.mock.mockImplementation(async () => {
        markProcessingStarted();
        return processingResult;
      });

      const pendingResponse = receive(JSON.stringify(message));

      try {
        await processingStarted;
        strictEqual(respond.mock.callCount(), 0);
      } finally {
        finishProcessing('frontline-message-test');
      }

      deepStrictEqual(await pendingResponse, [{ statusCode: 200 }]);
      strictEqual(processMessage.mock.callCount(), 1);
      strictEqual(respond.mock.callCount(), 1);
    },
  );
}

test('allows file sizes through 50 MiB to reach the next validation guard', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const fileSize of [
    0,
    25 * 1024 * 1024 + 1,
    50 * 1024 * 1024 - 1,
    50 * 1024 * 1024,
  ]) {
    const body = JSON.stringify({
      ...TEXT_MESSAGE,
      message: {
        type: 'file',
        media: 'https://example.com/attachment.pdf',
        file_size: fileSize,
      },
    });

    // An absent filename isolates size validation; incoming media is not wired yet.
    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber file name' } },
    ]);
  }
  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects invalid file sizes and one byte over 50 MiB before processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const fileSize of [
    undefined,
    null,
    '1',
    -1,
    1.5,
    50 * 1024 * 1024 + 1,
  ]) {
    const body = JSON.stringify({
      ...TEXT_MESSAGE,
      message: {
        type: 'file',
        media: 'https://example.com/attachment.pdf',
        file_name: 'attachment.pdf',
        file_size: fileSize,
      },
    });

    deepStrictEqual(await receive(body), [
      { statusCode: 400, body: { error: 'Invalid Viber file size' } },
    ]);
  }
  strictEqual(processMessage.mock.callCount(), 0);
});

test('processes validated media and stickers without fetching inside the controller', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const fetchMedia = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('The controller delegates downloads to the processor');
  });
  const messages = [
    { type: 'picture', media: 'https://example.com/picture.jpg' },
    { type: 'video', media: 'https://example.com/video.mp4' },
    {
      type: 'file',
      media: 'https://example.com/file.pdf',
      file_name: 'file.pdf',
      file_size: 100,
    },
    { type: 'sticker', sticker_id: 46105 },
  ];

  for (const message of messages) {
    deepStrictEqual(
      await receive(JSON.stringify({ ...TEXT_MESSAGE, message })),
      [
        {
          statusCode: 200,
        },
      ],
    );
  }

  strictEqual(processMessage.mock.callCount(), 4);
  deepStrictEqual(processMessage.mock.calls[0].arguments[1], {
    inboxId: 'inbox-test',
    userId: TEXT_MESSAGE.sender.id,
    messageToken: TEXT_MESSAGE.message_token,
    text: '',
    name: 'Chingun',
    media: {
      source: 'https://example.com/picture.jpg',
      messageType: 'picture',
      fileName: 'viber-picture',
      allowedHostnames: ['media.example.com'],
    },
  });
  strictEqual(fetchMedia.mock.callCount(), 0);
});

test('validation errors still return 400 before the unimplemented-message fallback', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const cases = [
    {
      message: { type: 'picture' },
      error: 'Invalid Viber media message',
    },
    {
      message: { type: 'sticker', sticker_id: 'not-an-id' },
      error: 'Invalid Viber sticker message',
    },
    {
      message: { type: 'unknown-message-type' },
      error: 'Unsupported Viber message type',
    },
  ];

  for (const { message, error } of cases) {
    deepStrictEqual(
      await receive(JSON.stringify({ ...TEXT_MESSAGE, message })),
      [{ statusCode: 400, body: { error } }],
    );
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

test('rejects incomplete lifecycle events without message processing', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);

  for (const event of [
    'subscribed',
    'unsubscribed',
    'conversation_started',
    'delivered',
    'seen',
    'failed',
  ]) {
    deepStrictEqual(await receive(JSON.stringify({ event })), [
      { statusCode: 400, body: { error: 'Invalid Viber lifecycle event' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
  deepStrictEqual(await receive(JSON.stringify({ event: 'unknown-event' })), [
    { statusCode: 200 },
  ]);
});

test('unimplemented messages and events still require a valid signature before the fallback', async (t) => {
  const { receive, processMessage } = createReceiverHarness(t);
  const bodies = [
    JSON.stringify({
      ...TEXT_MESSAGE,
      message: { type: 'sticker', sticker_id: 46105 },
    }),
    JSON.stringify({ event: 'delivered' }),
  ];

  for (const body of bodies) {
    deepStrictEqual(await receive(body, { signature: '0'.repeat(64) }), [
      { statusCode: 401, body: { error: 'Invalid Viber signature' } },
    ]);
  }

  strictEqual(processMessage.mock.callCount(), 0);
});

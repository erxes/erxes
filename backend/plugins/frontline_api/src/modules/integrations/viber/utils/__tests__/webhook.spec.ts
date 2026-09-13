import { test } from 'node:test';
import { deepStrictEqual, ok, strictEqual, throws } from 'node:assert';
import { isViberMessageToken, parseViberWebhookBody } from '../webhook';

test('preserves large Viber message tokens as strings', () => {
  // Keep the number in raw JSON so JavaScript cannot round the test input first.
  const rawBody = Buffer.from(
    '{"event":"message","message_token":4912661846655238145}',
  );

  deepStrictEqual(parseViberWebhookBody(rawBody), {
    event: 'message',
    message_token: '4912661846655238145',
  });
});

test('keeps neighboring large message tokens distinct', () => {
  const tokens = ['4912661846655238145', '4912661846655238146'];
  const parsed = tokens.map((token) =>
    parseViberWebhookBody(Buffer.from(`{"message_token":${token}}`)),
  );

  deepStrictEqual(parsed, [
    { message_token: '4912661846655238145' },
    { message_token: '4912661846655238146' },
  ]);
});

test('also converts safe integer message tokens to strings', () => {
  for (const token of ['0', '42', '9007199254740991']) {
    deepStrictEqual(
      parseViberWebhookBody(Buffer.from(`{"message_token":${token}}`)),
      { message_token: token },
    );
  }
});

test('preserves message tokens that are already strings', () => {
  for (const token of ['4912661846655238145', '000123']) {
    const payload = { message_token: token };

    deepStrictEqual(
      parseViberWebhookBody(Buffer.from(JSON.stringify(payload))),
      payload,
    );
  }
});

test('leaves ordinary fields and UTF-8 text unchanged', () => {
  const payload = {
    event: 'message',
    timestamp: 1234567890,
    sender: { id: 'viber-user', name: 'Сайн уу 👋' },
    message: {
      type: 'location',
      location: { lat: 47.918873, lon: 106.917701 },
    },
  };

  deepStrictEqual(
    parseViberWebhookBody(Buffer.from(JSON.stringify(payload))),
    payload,
  );
});

test('recognizes a message_token key containing a JSON escape', () => {
  const rawBody = Buffer.from('{"message\\u005ftoken":4912661846655238145}');

  deepStrictEqual(parseViberWebhookBody(rawBody), {
    message_token: '4912661846655238145',
  });
});

test('leaves missing and non-numeric tokens for the receiver to validate', () => {
  const payloads = [
    { event: 'webhook' },
    { message_token: null },
    { message_token: false },
    { message_token: {} },
    { message_token: [] },
  ];

  for (const payload of payloads) {
    deepStrictEqual(
      parseViberWebhookBody(Buffer.from(JSON.stringify(payload))),
      payload,
    );
  }
});

test('leaves non-object JSON payloads for the receiver to validate', () => {
  for (const payload of [null, [1, 'text', false], 'text', 42, true]) {
    deepStrictEqual(
      parseViberWebhookBody(Buffer.from(JSON.stringify(payload))),
      payload,
    );
  }
});

test('does not modify the original raw body bytes', () => {
  const rawBody = Buffer.from(
    ' { "message_token": 4912661846655238145, "text": "Сайн уу 👋" }\n',
  );
  const originalBody = Buffer.from(rawBody);

  parseViberWebhookBody(rawBody);

  deepStrictEqual(rawBody, originalBody);
});

test('throws a SyntaxError for empty or malformed JSON', () => {
  for (const body of [
    '',
    ' ',
    'not-json',
    '{"message_token":}',
    '{"message_token":123',
    '{"message_token":1,}',
    '{} trailing',
  ]) {
    throws(
      () => parseViberWebhookBody(Buffer.from(body)),
      SyntaxError,
      `Expected invalid JSON to be rejected: ${JSON.stringify(body)}`,
    );
  }
});

test('rejects numeric tokens when the parser cannot expose their source', (t) => {
  const nativeParse = JSON.parse;
  t.mock.method(
    JSON,
    'parse',
    (
      text: string,
      reviver?: (key: string, value: unknown) => unknown,
    ): unknown => {
      // Simulate a runtime that only passes key and value to the reviver.
      return nativeParse(text, (key: string, value: unknown): unknown =>
        reviver ? reviver(key, value) : value,
      );
    },
  );

  throws(
    () =>
      parseViberWebhookBody(
        Buffer.from('{"message_token":4912661846655238145}'),
      ),
    { message: 'Unable to preserve Viber message token' },
  );
});

test('accepts exact decimal token strings and narrows unknown values to strings', () => {
  for (const original of [
    '0',
    '42',
    '000123',
    '4912661846655238145',
    '18446744073709551615',
  ]) {
    const value: unknown = original;

    ok(isViberMessageToken(value));
    const token: string = value;
    strictEqual(token, original);
  }
});

test('rejects empty, padded, and non-decimal token strings', () => {
  for (const value of [
    '',
    ' ',
    ' 123',
    '123 ',
    '123\n',
    '123\r\n',
    '12\t34',
    '123\0',
    '+123',
    '-123',
    '1.23',
    '1e3',
    '0x123',
    '12a3',
    '\u0661\u0662\u0663',
    '123\u200b',
  ]) {
    strictEqual(isViberMessageToken(value), false);
  }
});

test('rejects every non-string token rather than converting its type', () => {
  for (const value of [
    undefined,
    null,
    true,
    false,
    0,
    123,
    NaN,
    Infinity,
    {},
    [],
    ['123'],
    () => '123',
    Symbol('123'),
  ]) {
    strictEqual(isViberMessageToken(value), false);
  }
});

test('does not call an object token coercion method', () => {
  let calls = 0;
  const value = {
    toString: () => {
      calls++;
      return '123';
    },
  };

  strictEqual(isViberMessageToken(value), false);
  strictEqual(calls, 0);
});

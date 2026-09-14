import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { setViberWebhook } from '../webhookApi';

const TOKEN = 'test-viber-token+/=';
const CALLBACK_URL =
  'https://Webhook.Example.test/viber/receive/inbox%2Ftest?tenant=test';

test('registers the unchanged callback URL with the original token and a ten-second deadline', async (t) => {
  const controller = new AbortController();
  const timeout = t.mock.method(
    AbortSignal,
    'timeout',
    () => controller.signal,
  );
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":0,"status_message":"ok"}'),
  );

  strictEqual(await setViberWebhook(TOKEN, CALLBACK_URL), undefined);

  strictEqual(fetchMock.mock.callCount(), 1);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  if (!options) throw new Error('Expected fetch options');

  strictEqual(url, 'https://chatapi.viber.com/pa/set_webhook');
  strictEqual(options.method, 'POST');
  const headers = new Headers(options.headers);
  strictEqual(headers.get('X-Viber-Auth-Token'), TOKEN);
  strictEqual(headers.get('Content-Type'), 'application/json');
  strictEqual(
    options.body,
    JSON.stringify({
      url: CALLBACK_URL,
      send_name: true,
      send_photo: false,
    }),
  );
  strictEqual(options.redirect, 'error');
  strictEqual(options.signal, controller.signal);
  deepStrictEqual(timeout.mock.calls[0].arguments, [10_000]);
});

test('removes the webhook only for an exactly empty callback URL', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":0}'),
  );

  strictEqual(await setViberWebhook(TOKEN, ''), undefined);
  strictEqual(fetchMock.mock.callCount(), 1);
  strictEqual(fetchMock.mock.calls[0].arguments[1]?.body, '{"url":""}');
});

test('rejects empty or whitespace-only tokens before registration or removal', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Invalid tokens must not reach the network');
  });

  for (const token of ['', ' ', '\t\n']) {
    for (const callbackUrl of [CALLBACK_URL, '']) {
      await rejects(setViberWebhook(token, callbackUrl), {
        message: 'Viber bot token is required',
      });
    }
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects padded tokens without silently trimming or contacting Viber', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Padded tokens must not reach the network');
  });

  for (const token of [` ${TOKEN}`, `${TOKEN} `, `\t${TOKEN}\n`]) {
    await rejects(setViberWebhook(token, CALLBACK_URL), {
      message:
        'Viber bot token must not contain leading or trailing whitespace',
    });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects invalid callback URLs without fetching or interpreting whitespace as removal', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Invalid callback URLs must not reach the network');
  });

  for (const callbackUrl of [
    ' ',
    '\t\n',
    ` ${CALLBACK_URL}`,
    `${CALLBACK_URL} `,
    'not-a-url',
    '/viber/receive/inbox-test',
    'https://',
    'http://webhook.example.test/viber',
    'ftp://webhook.example.test/viber',
    'file:///viber',
    'https://user@webhook.example.test/viber',
    'https://user:password@webhook.example.test/viber',
    `${CALLBACK_URL}#fragment`,
  ]) {
    await rejects(setViberWebhook(TOKEN, callbackUrl), {
      message: 'Invalid Viber webhook URL',
    });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects unsuccessful HTTP responses without exposing their bodies', async (t) => {
  let httpStatus = 401;
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('private provider detail', { status: httpStatus }),
  );

  for (httpStatus of [302, 401, 403, 429, 503]) {
    await rejects(setViberWebhook(TOKEN, CALLBACK_URL), {
      message: `Viber webhook request failed (HTTP ${httpStatus})`,
    });
  }
});

test('turns malformed JSON into a fixed error without exposing response text', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('private provider detail: not JSON'),
  );

  await rejects(setViberWebhook(TOKEN, CALLBACK_URL), {
    message: 'Invalid Viber webhook response',
  });
});

test('rejects malformed response shapes and non-integer provider statuses', async (t) => {
  let body: unknown;
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify(body)),
  );

  for (body of [
    null,
    [],
    0,
    'ok',
    {},
    { status: '0' },
    { status: false },
    { status: null },
    { status: 0.5 },
  ]) {
    await rejects(setViberWebhook(TOKEN, CALLBACK_URL), {
      message: 'Invalid Viber webhook response',
    });
  }
});

test('does not mistake HTTP success for successful registration or removal', async (t) => {
  let providerStatus = 1;
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          status: providerStatus,
          status_message: 'private provider detail',
        }),
      ),
  );

  for (providerStatus of [1, 2, 3]) {
    for (const callbackUrl of [CALLBACK_URL, '']) {
      await rejects(setViberWebhook(TOKEN, callbackUrl), {
        message: `Viber webhook update failed (status ${providerStatus})`,
      });
    }
  }
});

test('propagates network and timeout failures without retrying a potentially applied update', async (t) => {
  let failure: Error;
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw failure;
  });

  for (failure of [
    new Error('Network unavailable'),
    new DOMException('Request timed out', 'TimeoutError'),
  ]) {
    const callsBefore = fetchMock.mock.callCount();
    await rejects(
      setViberWebhook(TOKEN, CALLBACK_URL),
      (error: unknown) => error === failure,
    );
    strictEqual(fetchMock.mock.callCount(), callsBefore + 1);
  }
});

import { test } from 'node:test';
import { deepStrictEqual, strictEqual, throws, rejects } from 'node:assert';
import { parseViberAccountInfo, getViberAccountInfo } from '../account';

test('return only the Viber account id and name', () => {
  const val = {
    status: 0,
    id: 'pa:test',
    name: 'Support',
    subscribers_count: 42,
  };
  const expected = { id: 'pa:test', name: 'Support' };

  deepStrictEqual(parseViberAccountInfo(val), expected);
});

test('rejects an unsuccessful Viber account response', () => {
  const val = {
    status: 1,
    id: 'pa:test',
    name: 'Support',
  };

  throws(() => parseViberAccountInfo(val), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects a null account response', () => {
  throws(() => parseViberAccountInfo(null), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects an array account response', () => {
  throws(() => parseViberAccountInfo([]), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects an account response without id', () => {
  const val = {
    status: 0,
    name: 'Support',
  };

  throws(() => parseViberAccountInfo(val), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects an account response without name', () => {
  const val = {
    status: 0,
    id: 'pa:test',
  };

  throws(() => parseViberAccountInfo(val), {
    message: 'Invalid Viber account info response',
  });
});

test('fetches Viber account info successfully', async (t) => {
  const payload = { status: 0, id: 'pa:test', name: 'Support' };
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify(payload), { status: 200 }),
  );

  const result = await getViberAccountInfo('valid-token');

  strictEqual(fetchMock.mock.callCount(), 1);

  const [url, options] = fetchMock.mock.calls[0].arguments;
  if (!options) {
    throw new Error('Expected fetch to be called with options');
  }

  const headers = new Headers(options.headers);

  strictEqual(url, 'https://chatapi.viber.com/pa/get_account_info');
  strictEqual(options.method, 'POST');
  strictEqual(options.body, '{}');
  strictEqual(headers.get('X-Viber-Auth-Token'), 'valid-token');
  strictEqual(headers.get('Content-Type'), 'application/json');

  deepStrictEqual(result, { id: 'pa:test', name: 'Support' });
});

test('rejects a blank token without calling fetch', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 200 }),
  );

  await rejects(() => getViberAccountInfo('   '), {
    message: 'Viber bot token is required',
  });

  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects an empty string token without calling fetch', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 200 }),
  );

  await rejects(() => getViberAccountInfo(''), {
    message: 'Viber bot token is required',
  });

  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects with the HTTP status on a 401 response', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 401 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Viber account info request failed (HTTP 401)',
  });
});

test('rejects with the HTTP status on a 503 response', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 503 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Viber account info request failed (HTTP 503)',
  });
});

test('rejects with a safe message on invalid JSON', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('not json', { status: 200 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects when Viber reports a non-zero status', async (t) => {
  const payload = { status: 1, id: 'pa:test', name: 'Support' };
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify(payload), { status: 200 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects when id is numeric instead of a string', async (t) => {
  const payload = { status: 0, id: 12345, name: 'Support' };
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify(payload), { status: 200 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects when name is blank', async (t) => {
  const payload = { status: 0, id: 'pa:test', name: '   ' };
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify(payload), { status: 200 }),
  );

  await rejects(() => getViberAccountInfo('valid-token'), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects when fetch rejects due to network failure or timeout', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('The operation was aborted due to timeout');
  });

  await rejects(() => getViberAccountInfo('valid-token'));
});

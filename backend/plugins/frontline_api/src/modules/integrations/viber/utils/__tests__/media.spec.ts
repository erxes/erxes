import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { downloadViberMedia, readViberMediaResponse } from '../media';

const MEDIA_LIMITS = [
  { messageType: 'picture', maxBytes: 3 * 1024 * 1024 },
  { messageType: 'video', maxBytes: 26 * 1024 * 1024 },
  { messageType: 'file', maxBytes: 50 * 1024 * 1024 },
] as const;

// Test fixtures only; these are not production Viber media hostnames.
const ALLOWED_HOSTNAMES = ['media.example.test'] as const;
const MEDIA_URL = 'https://media.example.test/attachment';

const createResponse = (chunks: Uint8Array[], init: ResponseInit = {}) => {
  const state = { reads: 0, cancelled: false };
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (state.reads === chunks.length) {
          controller.close();
          return;
        }
        controller.enqueue(chunks[state.reads]);
        state.reads += 1;
      },
      cancel() {
        state.cancelled = true;
      },
    },
    { highWaterMark: 0 },
  );

  return { response: new Response(body, init), state };
};

test('joins exact binary chunks and normalizes the supplied MIME metadata', async () => {
  const { response } = createResponse(
    [new Uint8Array([0, 255]), new Uint8Array([128, 10])],
    { headers: { 'content-type': 'IMAGE/PNG; charset=binary' } },
  );

  deepStrictEqual(await readViberMediaResponse(response, 'picture'), {
    buffer: Buffer.from([0, 255, 128, 10]),
    mimetype: 'image/png',
  });
  strictEqual(response.body?.locked, false);
});

test('uses a generic MIME type when the header is absent or blank', async () => {
  for (const contentType of [undefined, '', '   ']) {
    const headers = new Headers();
    if (contentType !== undefined) headers.set('content-type', contentType);
    const { response } = createResponse([new Uint8Array([1])], { headers });

    strictEqual(
      (await readViberMediaResponse(response, 'file')).mimetype,
      'application/octet-stream',
    );
  }
});

for (const { messageType, maxBytes } of MEDIA_LIMITS) {
  test(`${messageType}: allows an empty stream and bytes just below or exactly at its limit`, async () => {
    for (const size of [0, maxBytes - 1, maxBytes]) {
      const { response } = createResponse([new Uint8Array(size)]);
      strictEqual(
        (await readViberMediaResponse(response, messageType)).buffer.byteLength,
        size,
      );
      strictEqual(response.body?.locked, false);
    }
  });

  test(`${messageType}: rejects an oversized declared length before reading and cancels the body`, async () => {
    const { response, state } = createResponse([new Uint8Array([1])], {
      headers: { 'content-length': String(maxBytes + 1) },
    });

    await rejects(readViberMediaResponse(response, messageType), {
      message: `Viber ${messageType} exceeds the ${
        maxBytes / (1024 * 1024)
      } MiB limit`,
    });
    deepStrictEqual(state, { reads: 0, cancelled: true });
    strictEqual(response.body?.locked, false);
  });

  test(`${messageType}: enforces actual bytes despite absent, understated, or invalid length headers`, async () => {
    const chunks = [
      new Uint8Array(maxBytes),
      new Uint8Array([1]),
      new Uint8Array([2]),
    ];

    for (const declaredSize of [undefined, '1', 'invalid']) {
      const headers = new Headers();
      if (declaredSize !== undefined)
        headers.set('content-length', declaredSize);
      const { response, state } = createResponse(chunks, { headers });

      await rejects(readViberMediaResponse(response, messageType), {
        message: `Viber ${messageType} exceeds the ${
          maxBytes / (1024 * 1024)
        } MiB limit`,
      });
      deepStrictEqual(state, { reads: 2, cancelled: true });
      strictEqual(response.body?.locked, false);
    }
  });
}

test('rejects unsuccessful HTTP responses without reading their bodies', async () => {
  for (const status of [302, 403, 503]) {
    const { response, state } = createResponse([new Uint8Array([1])], {
      status,
    });

    await rejects(readViberMediaResponse(response, 'file'), {
      message: `Viber attachment download failed (HTTP ${status})`,
    });
    deepStrictEqual(state, { reads: 0, cancelled: true });
    strictEqual(response.body?.locked, false);
  }

  await rejects(
    readViberMediaResponse(new Response(null, { status: 404 }), 'file'),
    {
      message: 'Viber attachment download failed (HTTP 404)',
    },
  );
});

test('rejects a successful response without a readable body', async () => {
  await rejects(readViberMediaResponse(new Response(null), 'file'), {
    message: 'Viber attachment response has no body',
  });
});

test('does not let MIME metadata choose a larger size limit', async () => {
  const { response, state } = createResponse([new Uint8Array([1])], {
    headers: {
      'content-type': 'application/octet-stream',
      'content-length': String(4 * 1024 * 1024),
    },
  });

  await rejects(readViberMediaResponse(response, 'picture'), /3 MiB limit/);
  deepStrictEqual(state, { reads: 0, cancelled: true });
  strictEqual(response.body?.locked, false);
});

test('does not give unsupported or missing message types a fallback limit', async () => {
  for (const messageType of [
    undefined,
    'url',
    'audio',
    'toString',
    'constructor',
  ]) {
    const { response, state } = createResponse([new Uint8Array([1])]);

    // @ts-expect-error Exercise an invalid caller without weakening the production input type.
    const result = readViberMediaResponse(response, messageType);
    await rejects(result, /Unsupported Viber media type/);
    deepStrictEqual(state, { reads: 0, cancelled: true });
    strictEqual(response.body?.locked, false);
  }
});

test('propagates a stream failure instead of returning partial bytes and releases the reader', async () => {
  const error = new Error('Connection interrupted');
  let reads = 0;
  const response = new Response(
    new ReadableStream<Uint8Array>({
      pull(controller) {
        if (reads++ === 0) controller.enqueue(new Uint8Array([1]));
        else controller.error(error);
      },
    }),
  );

  await rejects(
    readViberMediaResponse(response, 'file'),
    (caught: unknown) => caught === error,
  );
  strictEqual(response.body?.locked, false);
});

test('a cancellation failure does not replace the HTTP error or leave the reader locked', async () => {
  const response = new Response(
    new ReadableStream<Uint8Array>({
      cancel() {
        throw new Error('Cancellation failed');
      },
    }),
    { status: 503 },
  );

  await rejects(readViberMediaResponse(response, 'file'), {
    message: 'Viber attachment download failed (HTTP 503)',
  });
  strictEqual(response.body?.locked, false);
});

test('downloads from an approved HTTPS host with unchanged query parameters and bounded request options', async (t) => {
  const controller = new AbortController();
  const timeoutMock = t.mock.method(
    AbortSignal,
    'timeout',
    () => controller.signal,
  );
  const { response } = createResponse(
    [new Uint8Array([0, 255]), new Uint8Array([128, 10])],
    { headers: { 'content-type': 'IMAGE/PNG; charset=binary' } },
  );
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => response);
  const query = '?sig=a%2Bb%2Fc%3D&part=1&part=2';

  deepStrictEqual(
    await downloadViberMedia(
      `https://MEDIA.EXAMPLE.TEST:443/attachment${query}`,
      'picture',
      ALLOWED_HOSTNAMES,
    ),
    { buffer: Buffer.from([0, 255, 128, 10]), mimetype: 'image/png' },
  );

  strictEqual(fetchMock.mock.callCount(), 1);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  if (!(url instanceof URL) || !options) {
    throw new Error('Expected fetch to receive a parsed URL and options');
  }
  strictEqual(url.href, `${MEDIA_URL}${query}`);
  strictEqual(options.method ?? 'GET', 'GET');
  strictEqual(options.body, undefined);
  strictEqual(options.headers, undefined);
  strictEqual(options.redirect, 'error');
  strictEqual(options.signal, controller.signal);
  strictEqual(timeoutMock.mock.callCount(), 1);
  deepStrictEqual(timeoutMock.mock.calls[0].arguments, [30_000]);
  strictEqual(response.body?.locked, false);
});

test('rejects malformed, padded, or non-string media URLs before fetching', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected media request');
  });
  const sources: unknown[] = [
    '',
    '   ',
    ` ${MEDIA_URL}`,
    `${MEDIA_URL}\n`,
    '/attachment',
    'not a URL',
    'https://',
    null,
    undefined,
    42,
    {},
  ];

  for (const source of sources) {
    // @ts-expect-error Exercise invalid runtime input without weakening the public type.
    const result = downloadViberMedia(source, 'file', ALLOWED_HOSTNAMES);
    await rejects(result, { message: 'Invalid Viber media URL' });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects non-HTTPS URLs, credentials, alternate ports, and fragments before fetching', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected media request');
  });

  for (const source of [
    'http://media.example.test/attachment',
    'ftp://media.example.test/attachment',
    'file:///attachment',
    'data:text/plain,attachment',
    'https://user@media.example.test/attachment',
    'https://:password@media.example.test/attachment',
    'https://media.example.test:8443/attachment',
    `${MEDIA_URL}#fragment`,
  ]) {
    await rejects(downloadViberMedia(source, 'file', ALLOWED_HOSTNAMES), {
      message: 'Unsupported Viber media URL',
    });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('requires an exact approved hostname before fetching', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected media request');
  });

  for (const source of [
    'https://media.example.test.unapproved.test/attachment',
    'https://cdn.media.example.test/attachment',
    'https://unapproved.test/media.example.test',
    'https://localhost/attachment',
    'https://127.0.0.1/attachment',
    'https://[::1]/attachment',
    'https://169.254.169.254/attachment',
  ]) {
    await rejects(downloadViberMedia(source, 'file', ALLOWED_HOSTNAMES), {
      message: 'Unapproved Viber media host',
    });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('an empty approved-host list blocks downloads', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected media request');
  });

  await rejects(downloadViberMedia(MEDIA_URL, 'file', []), {
    message: 'Unapproved Viber media host',
  });
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('rejects unsupported or missing media types before fetching', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected media request');
  });

  for (const messageType of [undefined, 'url', 'constructor']) {
    const result = downloadViberMedia(
      MEDIA_URL,
      // @ts-expect-error Exercise an invalid caller before any network request.
      messageType,
      ALLOWED_HOSTNAMES,
    );
    await rejects(result, { message: 'Unsupported Viber media type' });
  }
  strictEqual(fetchMock.mock.callCount(), 0);
});

test('passes the requested media type to the bounded reader', async (t) => {
  let response = new Response(null);
  t.mock.method(globalThis, 'fetch', async () => response);

  for (const { messageType, maxBytes } of MEDIA_LIMITS) {
    const oversized = createResponse([new Uint8Array([1])], {
      headers: { 'content-length': String(maxBytes + 1) },
    });
    response = oversized.response;

    await rejects(
      downloadViberMedia(MEDIA_URL, messageType, ALLOWED_HOSTNAMES),
      {
        message: `Viber ${messageType} exceeds the ${
          maxBytes / (1024 * 1024)
        } MiB limit`,
      },
    );
    deepStrictEqual(oversized.state, { reads: 0, cancelled: true });
    strictEqual(response.body?.locked, false);
  }

  // A file must not inherit the smaller picture cap from its reported MIME type.
  response = new Response(new Uint8Array(4 * 1024 * 1024), {
    headers: { 'content-type': 'image/png' },
  });
  strictEqual(
    (await downloadViberMedia(MEDIA_URL, 'file', ALLOWED_HOSTNAMES)).buffer
      .byteLength,
    4 * 1024 * 1024,
  );
});

test('propagates HTTP errors through the reader and cleans up the response', async (t) => {
  const { response, state } = createResponse([new Uint8Array([1])], {
    status: 503,
  });
  t.mock.method(globalThis, 'fetch', async () => response);

  await rejects(downloadViberMedia(MEDIA_URL, 'file', ALLOWED_HOSTNAMES), {
    message: 'Viber attachment download failed (HTTP 503)',
  });
  deepStrictEqual(state, { reads: 0, cancelled: true });
  strictEqual(response.body?.locked, false);
});

test('propagates network and timeout failures without retrying', async (t) => {
  let failure: Error = new TypeError('Connection failed');
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw failure;
  });

  await rejects(
    downloadViberMedia(MEDIA_URL, 'file', ALLOWED_HOSTNAMES),
    (caught: unknown) => caught === failure,
  );
  strictEqual(fetchMock.mock.callCount(), 1);

  failure = new DOMException('Download timed out', 'TimeoutError');
  await rejects(
    downloadViberMedia(MEDIA_URL, 'file', ALLOWED_HOSTNAMES),
    (caught: unknown) => caught === failure,
  );
  strictEqual(fetchMock.mock.callCount(), 2);
});

test('propagates an abort during body reading without returning partial bytes or retaining the lock', async (t) => {
  const controller = new AbortController();
  const failure = new DOMException('Download timed out', 'TimeoutError');
  t.mock.method(AbortSignal, 'timeout', () => controller.signal);
  let reads = 0;
  const response = new Response(
    new ReadableStream<Uint8Array>(
      {
        start(streamController) {
          controller.signal.addEventListener(
            'abort',
            () => streamController.error(failure),
            { once: true },
          );
        },
        pull(streamController) {
          if (reads++ === 0) streamController.enqueue(new Uint8Array([1]));
          else controller.abort(failure);
        },
      },
      { highWaterMark: 0 },
    ),
  );
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => response);

  await rejects(
    downloadViberMedia(MEDIA_URL, 'file', ALLOWED_HOSTNAMES),
    (caught: unknown) => caught === failure,
  );
  strictEqual(fetchMock.mock.callCount(), 1);
  strictEqual(fetchMock.mock.calls[0].arguments[1]?.signal, controller.signal);
  strictEqual(reads, 2);
  strictEqual(response.body?.locked, false);
});

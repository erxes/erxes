import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { readViberMediaResponse } from '../media';

const MEDIA_LIMITS = [
  { messageType: 'picture', maxBytes: 3 * 1024 * 1024 },
  { messageType: 'video', maxBytes: 26 * 1024 * 1024 },
  { messageType: 'file', maxBytes: 50 * 1024 * 1024 },
] as const;

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

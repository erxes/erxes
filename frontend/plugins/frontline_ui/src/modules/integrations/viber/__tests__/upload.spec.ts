import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { uploadViberFile, VIBER_FILE_MAX_BYTES } from '../upload';

test('uploads through the existing authenticated endpoint with private storage requested', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    strictEqual(
      url,
      'https://erxes.example.test/gateway/upload-file?forcePrivate=true',
    );
    strictEqual(init?.credentials, 'include');
    strictEqual(init?.method, 'POST');
    strictEqual(init?.body instanceof FormData, true);
    return new Response('private-report.pdf');
  });
  const result = await uploadViberFile(
    new File(['abc'], 'report.pdf', { type: 'application/pdf' }),
    'https://erxes.example.test/gateway/',
  );
  deepStrictEqual(result, {
    name: 'report.pdf',
    url: 'private-report.pdf',
    type: 'application/pdf',
    size: 3,
  });
});

test('uses the Viber 50 MiB limit, not the shared uploader 20 MB default', async (t) => {
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('large.bin'),
  );
  await uploadViberFile(
    new File([new Uint8Array(VIBER_FILE_MAX_BYTES)], 'large.bin'),
    'https://erxes.example.test',
  );
  await rejects(
    uploadViberFile(
      new File([new Uint8Array(VIBER_FILE_MAX_BYTES + 1)], 'large.bin'),
      'https://erxes.example.test',
    ),
    /50 MiB/,
  );
  strictEqual(fetch.mock.callCount(), 1);
});

test('rejects invalid names and empty files before uploading', async (t) => {
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('unused'),
  );
  for (const name of ['no-extension', '../file.pdf', 'file\n.pdf'])
    await rejects(
      uploadViberFile(new File(['x'], name), 'https://erxes.example.test'),
      /filename/,
    );
  await rejects(
    uploadViberFile(new File([], 'empty.txt'), 'https://erxes.example.test'),
    /non-empty/,
  );
  strictEqual(fetch.mock.callCount(), 0);
});

test('does not accept public URLs or unsafe paths as private attachment keys', async (t) => {
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(''),
  );
  for (const key of [
    '',
    'https://cdn.example.test/file.pdf',
    '../file.pdf',
    '/file.pdf',
    'file%2fpdf',
  ]) {
    fetch.mock.mockImplementation(async () => new Response(key));
    await rejects(
      uploadViberFile(
        new File(['x'], 'file.pdf'),
        'https://erxes.example.test',
      ),
      /private file key/,
    );
  }
  fetch.mock.mockImplementation(
    async () => new Response('sensitive upstream error', { status: 500 }),
  );
  await rejects(
    uploadViberFile(new File(['x'], 'file.pdf'), 'https://erxes.example.test'),
    (error: Error) =>
      error.message.includes('upload failed') &&
      !error.message.includes('sensitive'),
  );
});

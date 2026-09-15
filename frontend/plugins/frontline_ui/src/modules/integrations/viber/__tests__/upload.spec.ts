import { test } from 'node:test';
import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { uploadViberFile, VIBER_FILE_MAX_BYTES } from '../upload';
import { getViberVideoLink } from '../attachment';

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

test('preserves Core Stream upload URLs as video attachments and exposes a playable link', async (t) => {
  const base =
    'https://customer-example.cloudflarestream.com/0123456789abcdef0123456789abcdef';
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(`${base}/manifest/video.m3u8`),
  );
  const attachment = await uploadViberFile(
    new File(['abc'], 'clip.mp4', { type: 'video/mp4' }),
    'https://erxes.example.test',
  );
  deepStrictEqual(attachment, {
    name: 'clip.mp4',
    type: 'video/mp4',
    size: 3,
    url: `${base}/manifest/video.m3u8`,
  });
  strictEqual(getViberVideoLink(attachment.url), `${base}/watch`);
  strictEqual(getViberVideoLink(`${base}/manifest/video.mpd`), `${base}/watch`);
  await rejects(
    uploadViberFile(
      new File(['abc'], 'photo.png', { type: 'image/png' }),
      'https://erxes.example.test',
    ),
    /does not support Viber attachments/,
  );
});

test('does not treat arbitrary or modified video URLs as Stream uploads', async (t) => {
  const base =
    'https://customer-example.cloudflarestream.com/0123456789abcdef0123456789abcdef';
  const source = `${base}/manifest/video.m3u8`;
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(''),
  );
  for (const url of [
    source.replace('https:', 'http:'),
    source.replace('.com/', '.com.evil.test/'),
    source.replace('customer-example', 'other'),
    `${source}?token=secret`,
    `${source}#x`,
    `${base}/watch`,
    'https://videos.example.test/movie.mp4',
  ]) {
    strictEqual(getViberVideoLink(url), null);
    fetch.mock.mockImplementation(async () => new Response(url));
    await rejects(
      uploadViberFile(
        new File(['abc'], 'clip.mp4', { type: 'video/mp4' }),
        'https://erxes.example.test',
      ),
      /does not support Viber attachments/,
    );
  }
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
      /does not support Viber attachments/,
    );
  }
  fetch.mock.mockImplementation(
    async () => new Response('sensitive upstream error', { status: 500 }),
  );
  await rejects(
    uploadViberFile(new File(['x'], 'file.pdf'), 'https://erxes.example.test'),
    (error: Error) =>
      error.message.includes('Unable to upload') &&
      !error.message.includes('sensitive'),
  );
});

import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual, throws } from 'node:assert';
import { buildViberSendParts, sendViberMessage } from '../send';
import { getViberVideoLink } from '../attachment';

test('Stream uploads become labeled playable links, not MP4 payloads or remote downloads', () => {
  const base =
    'https://customer-test.cloudflarestream.com/0123456789abcdef0123456789abcdef';
  const file = {
    name: 'demo.mp4',
    type: 'video/mp4',
    size: 123,
    url: `${base}/manifest/video.m3u8`,
  };
  deepStrictEqual(buildViberSendParts('', [file]).parts[0], {
    state: 'pending',
    attachment: file,
    body: { type: 'text', text: `Video: demo.mp4\n${base}/watch` },
  });
  strictEqual(getViberVideoLink(`${base}/manifest/video.mpd`), `${base}/watch`);
  for (const url of [
    `${base}/manifest/video.m3u8?x=1`,
    `${base}/manifest/video.m3u8#x`,
    base.replace('https:', 'http:') + '/manifest/video.m3u8',
    base.replace('.com', '.com.evil.test') + '/manifest/video.m3u8',
    'https://example.test/video.m3u8',
  ]) {
    strictEqual(getViberVideoLink(url), null);
    throws(() => buildViberSendParts('', [{ ...file, url }]));
  }
  throws(() => buildViberSendParts('', [{ ...file, type: 'application/pdf' }]));
});

test('turns Frontline HTML into plain text and preserves line breaks', () => {
  deepStrictEqual(buildViberSendParts('<p>Hello &amp; hi<br>there</p>'), {
    content: 'Hello & hi\nthere',
    parts: [
      { body: { type: 'text', text: 'Hello & hi\nthere' }, state: 'pending' },
    ],
  });
});

test('validates content, attachment count, file names, sizes, and storage keys before sending', () => {
  throws(() => buildViberSendParts(''));
  throws(() => buildViberSendParts('x'.repeat(7001)));
  const file = {
    name: 'report.pdf',
    url: 'tenant/random-report.pdf',
    size: 5,
    type: 'application/pdf',
  };
  for (const url of [
    'https://external.test/file.pdf',
    '//host/key',
    '../private',
    'x/../secret',
    '/absolute',
    'x%2fy',
    'x?y',
    'x\\y',
  ]) {
    throws(() => buildViberSendParts('', [{ ...file, url }]));
  }
  for (const name of ['noextension', '../x.pdf', 'x\n.pdf', 'x\\y.pdf'])
    throws(() => buildViberSendParts('', [{ ...file, name }]));
  strictEqual(
    buildViberSendParts('', [{ ...file, size: 0 }]).parts[0].attachment?.size,
    0,
  );
  for (const size of [-1, 1.5, NaN, Infinity, 50 * 1024 * 1024 + 1])
    throws(() => buildViberSendParts('', [{ ...file, size }]));
  throws(() =>
    buildViberSendParts(
      '',
      Array.from({ length: 11 }, () => file),
    ),
  );
});

test('selects iOS-safe pictures, bounded MP4 videos, and file fallback without discarding text', () => {
  const files = [
    {
      name: 'photo.png',
      url: 'photo.png',
      type: 'image/png',
      size: 1024 * 1024,
    },
    {
      name: 'large.png',
      url: 'large.png',
      type: 'image/png',
      size: 1024 * 1024 + 1,
    },
    {
      name: 'clip.mp4',
      url: 'clip.mp4',
      type: 'video/mp4',
      size: 26 * 1024 * 1024,
    },
    {
      name: 'large.mp4',
      url: 'large.mp4',
      type: 'video/mp4',
      size: 26 * 1024 * 1024 + 1,
    },
    { name: 'wrong.html', url: 'wrong.html', type: 'image/png', size: 10 },
  ];
  const result = buildViberSendParts('caption', files);
  deepStrictEqual(
    result.parts.map((part) => part.body.type),
    ['text', 'picture', 'file', 'video', 'file', 'file'],
  );
  strictEqual(result.parts[1].attachment?.url, 'photo.png');
});

test('accepts supported structured replies and rejects raw provider payload overrides', () => {
  for (const message of [
    { type: 'url', media: 'https://example.test/page' },
    { type: 'location', location: { lat: 47.9, lon: 106.9 } },
    {
      type: 'contact',
      contact: { name: 'Test', phone_number: '+97612345678' },
    },
    { type: 'sticker', sticker_id: '46105' },
  ])
    deepStrictEqual(
      buildViberSendParts('', [], message).parts[0].body,
      message,
    );
  for (const message of [
    { type: 'url', media: 'javascript:alert(1)' },
    { type: 'url', media: 'https://example.test', receiver: 'other-user' },
    { type: 'location', location: { lat: 91, lon: 100 } },
    { type: 'contact', contact: { name: '', phone_number: '' } },
    { type: 'sticker', sticker_id: '-1' },
    { type: 'file', media: 'https://arbitrary.test/file' },
  ])
    throws(() => buildViberSendParts('', [], message));
});

test('sends only to the fixed endpoint with exact credentials and lossless provider tokens', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, init) => {
    strictEqual(url, 'https://chatapi.viber.com/pa/send_message');
    strictEqual(init?.method, 'POST');
    strictEqual(init?.redirect, 'error');
    strictEqual(
      new Headers(init?.headers).get('X-Viber-Auth-Token'),
      'test-token',
    );
    ok(init?.signal instanceof AbortSignal);
    deepStrictEqual(JSON.parse(String(init?.body)), {
      type: 'text',
      text: 'Hello',
      receiver: 'user',
      sender: { name: 'Bot' },
    });
    return new Response('{"status":0,"message_token":4912661846655238145}');
  });
  deepStrictEqual(
    await sendViberMessage('test-token', 'user', 'Bot', {
      type: 'text',
      text: 'Hello',
    }),
    { state: 'sent', messageToken: '4912661846655238145' },
  );
  strictEqual(fetchMock.mock.callCount(), 1);
});

test('distinguishes provider rejection from unconfirmed HTTP, parsing, token, or network failures', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{"status":6}'),
  );
  const send = () =>
    sendViberMessage('test-token', 'user', 'Bot', {
      type: 'text',
      text: 'Hello',
    });
  strictEqual((await send()).state, 'rejected');
  for (const response of [
    new Response('oops', { status: 500 }),
    new Response('not json'),
    new Response('{"status":0}'),
    new Response('{"status":"0"}'),
    new Response('{"status":0,"message_token":1.5}'),
  ]) {
    fetchMock.mock.mockImplementation(async () => response);
    strictEqual((await send()).state, 'unknown');
  }
  fetchMock.mock.mockImplementation(async () => {
    throw new Error('private-token-and-url');
  });
  const result = await send();
  strictEqual(result.state, 'unknown');
  ok(!JSON.stringify(result).includes('private-token'));
  strictEqual(fetchMock.mock.callCount(), 7);
});

test('rejects padded tokens and oversize serialized requests before fetch', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('unexpected network');
  });
  await rejects(
    sendViberMessage(' token ', 'user', 'Bot', { type: 'text', text: 'Hello' }),
  );
  await rejects(
    sendViberMessage('token', 'user', 'Bot', {
      type: 'text',
      text: 'x'.repeat(31 * 1024),
    }),
  );
  strictEqual(fetchMock.mock.callCount(), 0);
});

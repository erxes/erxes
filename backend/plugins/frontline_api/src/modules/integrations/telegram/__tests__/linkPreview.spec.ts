import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import type { ClientRequest, IncomingMessage } from 'node:http';
import type { LookupAddress, LookupAllOptions } from 'node:dns';
import {
  parseTelegramLinkPreview,
  readTelegramPreviewHtml,
  telegramMessageLinks,
} from '../utils/linkPreview';

jest.mock('node:dns/promises', () => ({ lookup: jest.fn() }));
jest.mock('node:https', () => ({ request: jest.fn() }));

// Jest otherwise selects Node's single-address overload instead of all:true.
const lookupAll =
  jest.mocked<
    (hostname: string, options: LookupAllOptions) => Promise<LookupAddress[]>
  >(lookup);

beforeEach(() => jest.clearAllMocks());

test('extracts at most two distinct HTTP links, decodes ampersands and preserves balanced parentheses', () => {
  expect(
    telegramMessageLinks(
      '<a href="https://example.com/a_(b)?x=1&amp;y=2">screen recording</a> https://example.org/end). https://third.example/',
    ),
  ).toEqual(['https://example.com/a_(b)?x=1&y=2', 'https://example.org/end']);
  expect(telegramMessageLinks('<a href="javascript:alert(1)">bad</a>')).toEqual(
    [],
  );
});

test('normalizes video cards into the same embed contract as Discord without embedding page scripts', () => {
  const result = parseTelegramLinkPreview(
    '<head><meta content="player" name="twitter:card"><meta content="Recording &amp; demo" property="og:title"><meta property="og:description" content="A short &#x1f600; video"><meta property="og:image" content="/poster.png"><script><meta property="og:title" content="bad"></script></head>',
    'https://example.com/share',
  );
  expect(result).toMatchObject({
    type: 'video',
    title: 'Recording & demo',
    description: 'A short 😀 video',
    image: { url: 'https://example.com/poster.png' },
  });
  expect(
    parseTelegramLinkPreview(
      '<meta property="og:image" content="javascript:alert(1)">',
      'https://example.com',
    ).image,
  ).toBeUndefined();
});

test('handles long punctuation and malformed metadata without repeated suffix scans', () => {
  const url = `https://example.com/${'.'.repeat(100_000)}x`;
  expect(telegramMessageLinks(`${url}).`)).toEqual([url]);
  expect(
    telegramMessageLinks(`https://example.com/a_(b)${')'.repeat(100_000)}.`),
  ).toEqual(['https://example.com/a_(b)']);
  const preview = parseTelegramLinkPreview(
    `<meta ${'a'.repeat(
      100_000,
    )} content="ignored"><meta property=og:title content='Good'><meta name="description" content="kept">`,
    'https://example.com',
  );
  expect(preview).toMatchObject({ title: 'Good', description: 'kept' });
});

test.each(['127.0.0.1', '::1', '169.254.169.254', '::ffff:127.0.0.1'])(
  'never connects to nonpublic preview address %s',
  async (address) => {
    lookupAll.mockResolvedValue([
      { address, family: address.includes(':') ? 6 : 4 },
    ]);
    await expect(
      readTelegramPreviewHtml('https://example.com'),
    ).rejects.toThrow('not public');
    expect(request).not.toHaveBeenCalled();
  },
);

test.each([
  'http://example.com',
  'https://user:pass@example.com',
  'https://example.com:444',
])('rejects unsafe preview URL %s before DNS', async (url) => {
  await expect(readTelegramPreviewHtml(url)).rejects.toThrow('public HTTPS');
  expect(lookup).not.toHaveBeenCalled();
});

const mockHtmlResponse = (
  status: number,
  headers: IncomingMessage['headers'],
  body = '<title>Preview</title>',
) => {
  // Node's socket-backed request/response boundary is replaced by streams.
  const stream = new PassThrough();
  const response = stream as unknown as IncomingMessage;
  response.statusCode = status;
  response.headers = headers;
  const req = new EventEmitter() as ClientRequest;
  req.end = jest.fn(() => req);
  jest.mocked(request).mockImplementationOnce((_url, _options, callback) => {
    queueMicrotask(() => {
      callback?.(response);
      if (!response.destroyed) stream.end(body);
    });
    return req;
  });
};

test('pins the validated address and revalidates redirects before connecting', async () => {
  lookupAll
    .mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }])
    .mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }]);
  mockHtmlResponse(302, { location: 'https://private.example/secret' });
  await expect(readTelegramPreviewHtml('https://example.com')).rejects.toThrow(
    'not public',
  );
  expect(request).toHaveBeenCalledTimes(1);
  const options = jest.mocked(request).mock.calls[0][1];
  expect(options).toMatchObject({ family: 4 });
  const callback = jest.fn();
  if (typeof options === 'object')
    options.lookup?.('example.com', {}, callback);
  expect(callback).toHaveBeenCalledWith(null, '93.184.216.34', 4);
});

test('stops oversized streamed HTML even without a Content-Length header', async () => {
  lookupAll.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  mockHtmlResponse(
    200,
    { 'content-type': 'text/html' },
    'x'.repeat(512 * 1024 + 1),
  );
  await expect(readTelegramPreviewHtml('https://example.com')).rejects.toThrow(
    'too large',
  );
});

test('accepts bounded HTML and rejects non-HTML resources', async () => {
  lookupAll.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  mockHtmlResponse(200, { 'content-type': 'text/html; charset=utf-8' });
  await expect(readTelegramPreviewHtml('https://example.com')).resolves.toEqual(
    { html: '<title>Preview</title>', url: 'https://example.com/' },
  );
  mockHtmlResponse(200, { 'content-type': 'application/octet-stream' });
  await expect(readTelegramPreviewHtml('https://example.com')).rejects.toThrow(
    'No HTML preview',
  );
});

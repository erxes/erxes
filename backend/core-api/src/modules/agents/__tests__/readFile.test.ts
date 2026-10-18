import { isPrivateIp } from '@/agents/readFile';
jest.mock('dns/promises', () => ({
  lookup: jest.fn(async (hostname: string) => {
    if (hostname === '127.0.0.1' || hostname === 'localhost') {
      return [{ address: '127.0.0.1', family: 4 }];
    }
    if (hostname === '169.254.169.254') {
      return [{ address: '169.254.169.254', family: 4 }];
    }
    if (hostname === '10.1.2.3') {
      return [{ address: '10.1.2.3', family: 4 }];
    }
    if (hostname === 'internal.cdn.test') {
      return [{ address: '10.0.0.8', family: 4 }];
    }
    if (hostname === 'rebind.test') {
      return [
        { address: '1.1.1.1', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ];
    }
    return [{ address: '1.1.1.1', family: 4 }];
  }),
}));

jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(),
  readFileFromStorage: jest.fn(),
  sanitizeKey: (key: string) => {
    if (!key) throw new Error('Key cannot be empty');
    if (/^https?:\/\//i.test(key)) throw new Error('protocol');
    if (key.includes('..')) throw new Error('traversal');
    if (key.includes('\\')) throw new Error('slash');
    return key;
  },
}));

import { Readable } from 'stream';
import {
  readFileFromStorage,
  readFileStreamFromStorage,
} from 'erxes-api-shared/utils';
import {
  AGENTS_READ_IMAGE_MAX_BYTES,
  assertReadableFileUrl,
  buildReadFileTool,
  expandIpv4Hostname,
  extractReadFileKey,
  httpTransport,
  isAllowedAttachmentUrl,
  isPrivateIpv4,
  isStorageKeyReference,
  readAgentsUploadedFile,
} from '@/agents/readFile';

import { prepareAgentsFileMessage } from '@/agents/fileBinding';

const originalDownload = httpTransport.download;
afterEach(() => {
  jest.clearAllMocks();
  jest.mocked(readFileFromStorage).mockReset();
  httpTransport.download = originalDownload;
});

describe('expandIpv4Hostname', () => {
  it('expands compact and decimal loopbacks', () => {
    expect(expandIpv4Hostname('127.1')).toBe('127.0.0.1');
    expect(expandIpv4Hostname('2130706433')).toBe('127.0.0.1');
    expect(expandIpv4Hostname('127.0.0.1')).toBe('127.0.0.1');
  });
});

describe('isPrivateIpv4', () => {
  it('treats loopback, rfc1918, and metadata as private', () => {
    expect(isPrivateIpv4('127.0.0.1')).toBe(true);
    expect(isPrivateIpv4('10.0.0.1')).toBe(true);
    expect(isPrivateIpv4('169.254.169.254')).toBe(true);
    expect(isPrivateIpv4('1.1.1.1')).toBe(false);
  });
});

describe('assertReadableFileUrl', () => {
  it.each([
    'file:///etc/passwd',
    'FILE://C:/Windows/win.ini',
    'data:text/plain,hi',
    'javascript:alert(1)',
    'http://127.0.0.1/secret',
    'http://127.1/secret',
    'http://2130706433/secret',
    'http://localhost/secret',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.1.2.3/private',
    'http://internal.cdn.test/img.png',
    'http://rebind.test/x',
    'https://user:pass@example.com/x',
    'http://example.com/../etc/passwd',
    'http://example.com/%2e%2e/etc/passwd',
  ])('rejects %s', async (url) => {
    await expect(assertReadableFileUrl(url)).rejects.toThrow(
      'This file location cannot be read.',
    );
  });

  it('allows a public https url', async () => {
    const result = await assertReadableFileUrl(
      'https://imagedelivery.net/abc/shot.png',
    );
    expect(result.url.hostname).toBe('imagedelivery.net');
    expect(result.addresses).toEqual(['1.1.1.1']);
  });
});

describe('isStorageKeyReference', () => {
  it('treats platform keys as keys, not urls', () => {
    expect(isStorageKeyReference('abcshot.png')).toBe(true);
    expect(
      isStorageKeyReference('https://imagedelivery.net/abc/shot.png'),
    ).toBe(false);
    expect(isStorageKeyReference('file:///etc/passwd')).toBe(false);
  });
});

describe('extractReadFileKey', () => {
  it('pulls the storage key off a platform read-file url', () => {
    expect(
      extractReadFileKey(
        new URL('https://api.erxes.io/read-file?key=abcshot.png'),
      ),
    ).toBe('abcshot.png');
  });
});

describe('isAllowedAttachmentUrl', () => {
  it('accepts the stamped url or a matching read-file key', () => {
    expect(
      isAllowedAttachmentUrl('https://imagedelivery.net/a.png', [
        'https://imagedelivery.net/a.png',
      ]),
    ).toBe(true);
    expect(
      isAllowedAttachmentUrl('abcshot.png', [
        'https://api.erxes.io/read-file?key=abcshot.png',
      ]),
    ).toBe(true);
    expect(isAllowedAttachmentUrl('https://evil.test/x', ['abcshot.png'])).toBe(
      false,
    );
    expect(isAllowedAttachmentUrl('https://evil.test/x', [])).toBe(false);
  });
});

describe('readAgentsUploadedFile', () => {
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
  ]);

  it('reads a storage-key CSV through the shared helper', async () => {
    const csv = 'name,code\nTea,1\n';
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValue(Readable.from([Buffer.from(csv)]));
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'products.csv',
        allowedUrls: ['products.csv'],
      }),
    ).resolves.toMatchObject({ kind: 'text', text: csv });
  });

  it('sniffs a storage-key png without a content type', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValue(Readable.from([png]));
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'shot.png',
        allowedUrls: ['shot.png'],
      }),
    ).resolves.toMatchObject({
      kind: 'image',
      mimeType: 'image/png',
    });
  });

  it('reads Cloudflare Images keys through the CDN-aware platform reader when R2 misses', async () => {
    const key = 'tenant-bucket/uploaded-image.png';
    jest.mocked(readFileStreamFromStorage).mockResolvedValue(
      new Readable({
        read() {
          this.destroy(new Error('NoSuchKey'));
        },
      }),
    );
    jest.mocked(readFileFromStorage).mockResolvedValue(png);
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: key,
        allowedUrls: [key],
      }),
    ).resolves.toMatchObject({
      kind: 'image',
      mimeType: 'image/png',
      imageBase64: png.toString('base64'),
    });
    expect(readFileFromStorage).toHaveBeenCalledWith({
      subdomain: 'acme',
      key,
    });
  });

  it('keeps the image byte limit on CDN-aware storage reads', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockRejectedValue(new Error('NoSuchKey'));
    jest
      .mocked(readFileFromStorage)
      .mockResolvedValue(
        Buffer.concat([png, Buffer.alloc(AGENTS_READ_IMAGE_MAX_BYTES)]),
      );
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'large.png',
        allowedUrls: ['large.png'],
      }),
    ).rejects.toThrow('Images must be at most 2 MiB');
  });

  it('reports missing CDN images without passing metadata to the model', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockRejectedValue(new Error('NoSuchKey'));
    jest.mocked(readFileFromStorage).mockResolvedValue(null);
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'missing.png',
        allowedUrls: ['missing.png'],
      }),
    ).rejects.toThrow('Could not read the image from file storage');
  });

  it('does not use the buffered fallback for non-image keys', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockRejectedValue(new Error('NoSuchKey'));
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'missing.csv',
        allowedUrls: ['missing.csv'],
      }),
    ).rejects.toThrow('NoSuchKey');
    expect(readFileFromStorage).not.toHaveBeenCalled();
  });

  it('refuses urls that were not attached on this turn', async () => {
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'https://imagedelivery.net/abc/shot.png',
        allowedUrls: ['other.png'],
      }),
    ).rejects.toThrow('This file location cannot be read.');
  });

  it('does not treat file urls as storage keys', async () => {
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'file:///etc/passwd',
        allowedUrls: ['file:///etc/passwd'],
      }),
    ).rejects.toThrow('This file location cannot be read.');
    expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  });

  it('rejects traversed storage keys', async () => {
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: '../secret.csv',
        allowedUrls: ['../secret.csv'],
      }),
    ).rejects.toThrow('This file location cannot be read.');
    expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  });

  it('reads a platform read-file url as a tenant storage key', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValue(Readable.from([png]));
    await readAgentsUploadedFile({
      subdomain: 'acme',
      url: 'https://api.erxes.io/read-file?key=shot.png',
      allowedUrls: ['shot.png'],
    });
    expect(readFileStreamFromStorage).toHaveBeenCalledWith({
      subdomain: 'acme',
      key: 'shot.png',
    });
  });

  it('passes downloaded image bytes to the model without a provider-side URL fetch', async () => {
    httpTransport.download = jest.fn(async (url: URL) => ({
      bytes: png,
      mimeType: 'image/png',
      url: url.toString(),
    }));
    const result = await readAgentsUploadedFile({
      subdomain: 'acme',
      url: 'https://imagedelivery.net/abc/shot.png',
      allowedUrls: ['https://imagedelivery.net/abc/shot.png'],
    });
    expect(result).toEqual({
      url: 'https://imagedelivery.net/abc/shot.png',
      mimeType: 'image/png',
      kind: 'image',
      imageBase64: png.toString('base64'),
    });
    const tool = await buildReadFileTool();
    expect(tool.toModelOutput?.(result)).toEqual({
      type: 'content',
      value: [
        { type: 'text', text: 'Image (image/png)' },
        {
          type: 'image-data',
          data: png.toString('base64'),
          mimeType: 'image/png',
        },
      ],
    });
  });

  it('binds CDN image bytes directly while preserving mixed text attachments', async () => {
    httpTransport.download = jest.fn(async (url: URL) => ({
      bytes: png,
      mimeType: 'image/png',
      url: url.toString(),
    }));
    const csv = 'name,code\nTea,1\n';
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValue(Readable.from([Buffer.from(csv)]));
    const message = await prepareAgentsFileMessage(
      'acme',
      {
        id: 'u1',
        role: 'user',
        parts: [{ type: 'text', text: 'Compare these' }],
      },
      [
        {
          name: 'shot.png',
          url: 'https://imagedelivery.net/shot.png',
          type: 'image/png',
          size: png.length,
        },
        {
          name: 'products.csv',
          url: 'products.csv',
          type: 'text/csv',
          size: Buffer.byteLength(csv),
        },
      ],
    );
    expect(httpTransport.download).toHaveBeenCalled();
    expect(message.parts).toContainEqual({
      type: 'file',
      mediaType: 'image/png',
      url: `data:image/png;base64,${png.toString('base64')}`,
    });
    expect(JSON.stringify(message)).toContain('Tea,1');
    expect(JSON.stringify(message)).toContain('Compare these');
  });

  it('enforces the image byte limit for HTTP downloads too', async () => {
    httpTransport.download = jest.fn(async (url: URL) => ({
      bytes: Buffer.concat([png, Buffer.alloc(AGENTS_READ_IMAGE_MAX_BYTES)]),
      mimeType: 'image/png',
      url: url.toString(),
    }));
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'https://imagedelivery.net/large.png',
        allowedUrls: ['https://imagedelivery.net/large.png'],
      }),
    ).rejects.toThrow('Images must be at most 2 MiB');
  });

  it('does not treat svg as a model image', async () => {
    httpTransport.download = jest.fn(async (url: URL) => ({
      bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
      mimeType: 'image/svg+xml',
      url: url.toString(),
    }));
    await expect(
      readAgentsUploadedFile({
        subdomain: 'acme',
        url: 'https://imagedelivery.net/abc/shot.svg',
        allowedUrls: ['https://imagedelivery.net/abc/shot.svg'],
      }),
    ).resolves.toMatchObject({ kind: 'binary' });
  });
});

describe('non-public and tunneled attachment addresses', () => {
  it.each([
    '198.18.0.1',
    '198.19.255.254',
    '192.0.0.8',
    '224.0.0.1',
    '255.255.255.255',
    'fec0::1',
    'ff02::1',
    '64:ff9b::7f00:1',
    '2002:c0a8:101::1',
  ])('rejects %s', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });
});

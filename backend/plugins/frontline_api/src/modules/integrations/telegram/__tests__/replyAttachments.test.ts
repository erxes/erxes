import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { request } from 'node:https';
import type { Readable } from 'node:stream';
import {
  readFileFromStorage,
  readFileStreamFromStorage,
} from 'erxes-api-shared/utils';
import { prepareTelegramReplyFiles } from '../utils/replyAttachments';

jest.mock('node:dns/promises', () => ({ lookup: jest.fn() }));
jest.mock('node:https', () => ({
  request: jest.fn(
    (
      _url: URL,
      _options: unknown,
      onResponse: (
        response: Readable & {
          statusCode: number;
          headers: Record<string, string>;
        },
      ) => void,
    ) => {
      const { Readable } =
        jest.requireActual<typeof import('node:stream')>('node:stream');
      return {
        on: jest.fn(),
        end: () =>
          onResponse(
            Object.assign(Readable.from([Buffer.from('remote file')]), {
              statusCode: 200,
              headers: {},
            }),
          ),
      };
    },
  ),
}));
jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(() => {
    const { Readable } =
      jest.requireActual<typeof import('node:stream')>('node:stream');
    return Promise.resolve(Readable.from([Buffer.from('workspace file')]));
  }),
  readFileFromStorage: jest.fn(),
  isImage: () => false,
  sanitizeFilename: (name: string) => name,
}));

const lookupMock =
  jest.mocked<
    (hostname: string, options: { all: true }) => Promise<LookupAddress[]>
  >(lookup);

beforeEach(() => {
  jest.clearAllMocks();
  lookupMock.mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
});

test('downloads an absolute read-file URL from its host without interpreting its key locally', async () => {
  const url = 'https://external.example/read-file?key=tenant%2Fprivate.pdf';
  const [file] = await prepareTelegramReplyFiles('tenant', [{ url }]);
  expect(file.bytes).toEqual(Buffer.from('remote file'));
  expect(lookup).toHaveBeenCalledWith('external.example', { all: true });
  expect(request).toHaveBeenCalledWith(
    new URL(url),
    expect.objectContaining({ family: 4, lookup: expect.any(Function) }),
    expect.any(Function),
  );
  expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  expect(readFileFromStorage).not.toHaveBeenCalled();
});

test.each([
  'http://external.example/read-file?key=tenant%2Fprivate.pdf',
  'https://user:password@external.example/read-file?key=tenant%2Fprivate.pdf',
])(
  'rejects unsafe absolute read-file URLs before accessing storage: %s',
  async (url) => {
    await expect(
      prepareTelegramReplyFiles('tenant', [{ url }]),
    ).rejects.toThrow('Could not read the reply attachment');
    expect(readFileStreamFromStorage).not.toHaveBeenCalled();
    expect(readFileFromStorage).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  },
);

test('applies private-address protection to absolute read-file URLs', async () => {
  lookupMock.mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
  await expect(
    prepareTelegramReplyFiles('tenant', [
      { url: 'https://external.example/read-file?key=tenant%2Fprivate.pdf' },
    ]),
  ).rejects.toThrow('Could not read the reply attachment');
  expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  expect(readFileFromStorage).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

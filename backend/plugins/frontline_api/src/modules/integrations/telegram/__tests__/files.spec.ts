import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { getTelegramFile } from '../client';
import { downloadTelegramFile } from '../utils/downloadFile';
import {
  MAX_TELEGRAM_DOWNLOAD_BYTES,
  TelegramFileTooLargeError,
} from '../utils/fileLimits';
import { storeTelegramAttachment } from '../utils/attachments';
import { uploadFileToStorage } from 'erxes-api-shared/utils';

jest.mock('../client', () => ({ getTelegramFile: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  sanitizeFilename: (name: string) => name,
  uploadFileToStorage: jest.fn(),
}));
const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
const originalFetch = global.fetch;
const token = '123:fake-test-token';
let temporaryFile = '';
beforeAll(() => {
  global.fetch = fetchMock;
});
afterAll(() => {
  global.fetch = originalFetch;
});
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getTelegramFile).mockResolvedValue({
    file_id: 'f',
    file_unique_id: 'u',
    file_path: 'documents/a b.txt',
  });
  fetchMock.mockImplementation(async () => new Response('abc'));
  jest
    .mocked(uploadFileToStorage)
    .mockImplementation(async ({ filePath, subdomain, fileName }) => {
      temporaryFile = filePath;
      expect(subdomain).toBe('tenant-a');
      expect(fileName).toBe('report.txt');
      expect(await fs.readFile(filePath, 'utf8')).toBe('abc');
      expect((await fs.stat(filePath)).mode & 0o777).toBe(0o600);
      return 'workspace-key';
    });
});
test('downloads from a fixed host with encoded path segments, bounded timeout and no redirects', async () => {
  expect(await downloadTelegramFile(token, 'f')).toEqual(Buffer.from('abc'));
  expect(fetchMock.mock.calls[0][0]).toBe(
    `https://api.telegram.org/file/bot${token}/documents/a%20b.txt`,
  );
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: 'error' });
  expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
});
test.each(['../secret', 'a//b', '/absolute', 'a/./b'])(
  'rejects invalid provider paths %s',
  async (file_path) => {
    jest
      .mocked(getTelegramFile)
      .mockResolvedValueOnce({ file_id: 'f', file_unique_id: 'u', file_path });
    await expect(downloadTelegramFile(token, 'f')).rejects.toThrow(
      'invalid file path',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  },
);
test('checks lookup metadata, HTTP declared size and streamed size independently', async () => {
  jest.mocked(getTelegramFile).mockResolvedValueOnce({
    file_id: 'f',
    file_unique_id: 'u',
    file_path: 'f',
    file_size: MAX_TELEGRAM_DOWNLOAD_BYTES + 1,
  });
  await expect(downloadTelegramFile(token, 'f')).rejects.toBeInstanceOf(
    TelegramFileTooLargeError,
  );
  expect(fetchMock).not.toHaveBeenCalled();
  fetchMock.mockResolvedValueOnce(
    new Response('x', {
      headers: { 'content-length': String(MAX_TELEGRAM_DOWNLOAD_BYTES + 1) },
    }),
  );
  await expect(downloadTelegramFile(token, 'f')).rejects.toBeInstanceOf(
    TelegramFileTooLargeError,
  );
  fetchMock.mockResolvedValueOnce(
    new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(MAX_TELEGRAM_DOWNLOAD_BYTES));
          controller.enqueue(new Uint8Array(1));
          controller.close();
        },
      }),
    ),
  );
  await expect(downloadTelegramFile(token, 'f')).rejects.toBeInstanceOf(
    TelegramFileTooLargeError,
  );
});
test('persists through tenant storage with a safe basename and removes the private temporary file', async () => {
  const result = await storeTelegramAttachment({
    subdomain: 'tenant-a',
    token,
    fileId: 'f',
    fileName: '../../report.txt',
    mimeType: 'text/plain',
  });
  expect(result).toEqual({
    name: 'report.txt',
    type: 'text/plain',
    size: 3,
    url: 'workspace-key',
  });
  await expect(fs.access(dirname(temporaryFile))).rejects.toThrow();
});
test('storage failure is controlled and still removes temporary bytes', async () => {
  jest
    .mocked(uploadFileToStorage)
    .mockImplementationOnce(async ({ filePath }) => {
      temporaryFile = filePath;
      throw new Error('private-storage-error');
    });
  await expect(
    storeTelegramAttachment({ subdomain: 'tenant-a', token, fileId: 'f' }),
  ).rejects.toThrow('Check file upload settings');
  await expect(fs.access(dirname(temporaryFile))).rejects.toThrow();
});

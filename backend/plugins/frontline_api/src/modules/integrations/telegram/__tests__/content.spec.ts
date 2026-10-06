import { Readable } from 'node:stream';
import {
  getTelegramMessageContent,
  getTelegramMessageMetadata,
  getTelegramThreadId,
  telegramTextToHtml,
} from '../utils/content';
import { telegramMessageSchema } from '../utils/message';
import {
  isPublicTelegramFileAddress,
  prepareTelegramReplyFiles,
  readBoundedTelegramFile,
} from '../utils/replyAttachments';
import {
  readFileFromStorage,
  readFileStreamFromStorage,
} from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(),
  readFileFromStorage: jest.fn(),
  isImage: (key: string) => /\.(png|jpe?g)$/i.test(key),
  sanitizeFilename: (name: string) => name,
}));
const parse = (extra: Record<string, unknown>) =>
  telegramMessageSchema.parse({
    message_id: 7,
    date: 1_700_000_000,
    chat: { id: 123, type: 'private' },
    ...extra,
  });
describe('Telegram content adapter', () => {
  test('hides automatic topic-header replies while preserving explicit quotes and normal replies', () => {
    const message = parse({
      text: 'Topic message',
      is_topic_message: true,
      message_thread_id: 2,
      reply_to_message: {
        message_id: 2,
        chat: { id: 123, type: 'supergroup' },
        forum_topic_created: { name: 'QA Alpha' },
      },
    });
    expect(getTelegramMessageMetadata(message).replyTo).toBeUndefined();
    expect(
      getTelegramMessageMetadata({
        ...message,
        quote: { text: 'Selected quote' },
      }).replyTo?.content,
    ).toBe('Selected quote');
    expect(
      getTelegramMessageMetadata(
        parse({
          ...message,
          reply_to_message: {
            message_id: 3,
            chat: message.chat,
            text: 'Real reply',
          },
        }),
      ).replyTo?.content,
    ).toBe('Real reply');
  });
  test('keeps literal text, selects the largest photo and keeps its caption', () => {
    expect(
      getTelegramMessageContent(parse({ text: '  <hello>\nworld  ' })),
    ).toMatchObject({ content: '  <hello>\nworld  ' });
    expect(
      getTelegramMessageContent(
        parse({
          caption: 'caption',
          photo: [
            { file_id: 'small', file_unique_id: 's', width: 80, height: 80 },
            { file_id: 'big', file_unique_id: 'b', width: 800, height: 600 },
          ],
        }),
      ),
    ).toMatchObject({
      content: 'caption',
      attachment: {
        fileId: 'big',
        fileName: 'photo-b.jpg',
        mimeType: 'image/jpeg',
      },
    });
  });
  test('accepts documents without metadata, empty photo arrays, and attachment-only messages', () => {
    expect(
      getTelegramMessageContent(
        parse({ document: { file_id: 'doc', file_unique_id: 'd' } }),
      )?.attachment?.fileId,
    ).toBe('doc');
    expect(getTelegramMessageContent(parse({ photo: [] })).content).toContain(
      'View it in Telegram',
    );
    expect(getTelegramMessageContent(parse({ text: '  ' })).content).toContain(
      'View it in Telegram',
    );
  });
  test('does not mistake compatibility fields for photos/documents', () => {
    const document = { file_id: 'gif', file_unique_id: 'g' };
    expect(
      getTelegramMessageContent(parse({ animation: document, document })),
    ).toMatchObject({
      contentType: 'animation',
      attachment: { fileId: 'gif' },
    });
    expect(
      getTelegramMessageContent(parse({ live_photo: document, photo: [] })),
    ).toMatchObject({
      contentType: 'live_photo',
      attachment: { fileId: 'gif' },
    });
  });
  test('leaves a visible explanation for a known oversize incoming file', () => {
    const result = getTelegramMessageContent(
      parse({
        caption: 'large',
        document: {
          file_id: 'big',
          file_unique_id: 'b',
          file_size: 30 * 1024 * 1024,
        },
      }),
    );
    expect(result?.attachment).toBeUndefined();
    expect(result?.content).toContain('20 MB');
  });
  test('only forum topics partition a chat, ordinary reply thread IDs do not', () => {
    expect(getTelegramThreadId(parse({ message_thread_id: 99 }))).toBe(0);
    expect(
      getTelegramThreadId(
        parse({ message_thread_id: 99, is_topic_message: true }),
      ),
    ).toBe(99);
  });
  test('escapes provider text for the existing HTML message renderer', () => {
    expect(telegramTextToHtml('<img src=x> &\n"text"')).toBe(
      '&lt;img src=x&gt; &amp;<br>&quot;text&quot;',
    );
  });
  test.each([
    { caption: 1 },
    { document: { file_id: '' } },
    { photo: [{ file_id: 'p', file_unique_id: 'p', width: -1, height: 1 }] },
  ])('rejects malformed media %j', (extra) => {
    expect(() => parse(extra)).toThrow();
  });
});
describe('outgoing file preflight', () => {
  beforeEach(() => jest.clearAllMocks());
  test.each([
    '127.0.0.1',
    '10.1.2.3',
    '169.254.169.254',
    '172.16.1.1',
    '192.168.0.1',
    '::1',
    '::ffff:127.0.0.1',
    'fe80::1',
    'fc00::1',
    '100.64.0.1',
  ])('blocks nonpublic destination %s', (address) => {
    expect(isPublicTelegramFileAddress(address)).toBe(false);
  });
  test.each(['8.8.8.8', '2606:4700:4700::1111'])(
    'accepts public destination %s',
    (address) => {
      expect(isPublicTelegramFileAddress(address)).toBe(true);
    },
  );
  test('bounds actual streamed bytes and destroys a failed stream', async () => {
    const stream = Readable.from([Buffer.from('123'), Buffer.from('456')]);
    await expect(readBoundedTelegramFile(stream, 5)).rejects.toThrow('50 MB');
    expect(stream.destroyed).toBe(true);
    await expect(
      readBoundedTelegramFile(Readable.from([Buffer.from('123')]), 3),
    ).resolves.toEqual(Buffer.from('123'));
  });
  test('reads workspace keys with the tenant and detects image bytes, not a supplied MIME claim', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValueOnce(Readable.from([Buffer.from('%PDF')]))
      .mockResolvedValueOnce(Readable.from([Buffer.from([255, 216, 255, 0])]));
    const files = await prepareTelegramReplyFiles('tenant-a', [
      {
        url: '/read-file?key=folder%2Ffile.pdf',
        name: '../file.pdf',
        type: 'image/jpeg',
      },
      { url: 'photo-key', name: 'photo.jpg' },
    ]);
    expect(readFileStreamFromStorage).toHaveBeenNthCalledWith(1, {
      subdomain: 'tenant-a',
      key: 'folder/file.pdf',
    });
    expect(files.map((file) => file.asPhoto)).toEqual([false, true]);
    expect(files[0].name).toBe('file.pdf');
  });
  test('rejects unsafe locations and oversize metadata before any storage access', async () => {
    for (const url of [
      '../secrets',
      'http://localhost/private',
      'https://127.0.0.1/private',
      'file:///etc/passwd',
    ]) {
      await expect(
        prepareTelegramReplyFiles('tenant', [{ url }]),
      ).rejects.toThrow();
    }
    await expect(
      prepareTelegramReplyFiles('tenant', [
        { url: 'key', size: 60 * 1024 * 1024 },
      ]),
    ).rejects.toThrow();
    expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  });
  test('uses the public image reader for an image absent from object storage', async () => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockRejectedValueOnce(
        Object.assign(new Error('No such object'), { code: 'NoSuchKey' }),
      );
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    jest.mocked(readFileFromStorage).mockResolvedValueOnce(png);
    const [file] = await prepareTelegramReplyFiles('tenant-a', [
      { url: '/read-file?key=workspace%2Fimage.png' },
    ]);
    expect(readFileFromStorage).toHaveBeenCalledWith({
      subdomain: 'tenant-a',
      key: 'workspace/image.png',
    });
    expect(file).toMatchObject({ bytes: png, asPhoto: true });
  });
  test.each([
    ['image.png', new Error('Attachment read timed out')],
    ['image.png', Object.assign(new Error('Denied'), { code: 'AccessDenied' })],
    ['file.pdf', Object.assign(new Error('Absent'), { code: 'NoSuchKey' })],
  ])(
    'does not use a buffered fallback for other failures: %s',
    async (url, error) => {
      jest.mocked(readFileStreamFromStorage).mockRejectedValueOnce(error);
      await expect(
        prepareTelegramReplyFiles('tenant', [{ url }]),
      ).rejects.toThrow();
      expect(readFileFromStorage).not.toHaveBeenCalled();
    },
  );
  test.each([null, Buffer.alloc(50 * 1024 * 1024 + 1)])(
    'rejects missing or oversized buffered images before sending',
    async (bytes) => {
      jest
        .mocked(readFileStreamFromStorage)
        .mockRejectedValueOnce(
          Object.assign(new Error('Absent'), { code: 'NoSuchKey' }),
        );
      jest.mocked(readFileFromStorage).mockResolvedValueOnce(bytes);
      await expect(
        prepareTelegramReplyFiles('tenant', [{ url: 'image.png' }]),
      ).rejects.toThrow('Could not read the reply attachment');
    },
  );
});

test.each(['audio', 'video', 'voice', 'video_note', 'animation'])(
  'receives %s as an inbox file without dropping its caption',
  (kind) => {
    const result = getTelegramMessageContent(
      parse({
        caption: '<caption>',
        [kind]: { file_id: 'media', file_unique_id: 'id' },
      }),
    );
    expect(result).toMatchObject({
      content: '<caption>',
      contentType: kind,
      attachment: { fileId: 'media' },
    });
  },
);
test.each([
  {
    sticker: {
      file_id: 's',
      file_unique_id: 's',
      is_animated: false,
      is_video: false,
      emoji: '👍',
    },
  },
  { contact: { first_name: 'Alice', phone_number: '+1234' } },
  { location: { latitude: 47.9, longitude: 106.9 } },
  {
    venue: {
      title: 'Office',
      address: 'Main street',
      location: { latitude: 47.9, longitude: 106.9 },
    },
  },
  { dice: { emoji: '🎲', value: 6 } },
  { future_telegram_type: { value: 'unrecognized' }, caption: 'preserved' },
])('never silently drops non-text content %j', (extra) => {
  const result = getTelegramMessageContent(parse(extra));
  expect(result.content.length).toBeGreaterThan(0);
});
test('live photos retain the still and movie, and quote metadata does not leak nested data', () => {
  const result = getTelegramMessageContent(
    parse({
      live_photo: {
        file_id: 'movie',
        file_unique_id: 'm',
        photo: [
          { file_id: 'still', file_unique_id: 's', width: 100, height: 100 },
        ],
      },
    }),
  );
  expect(result.attachment?.fileId).toBe('still');
  expect(result.additionalAttachments?.[0].fileId).toBe('movie');
});

test.each([
  [
    Buffer.from('OggS\0\0OpusHead'),
    'application/octet-stream',
    'voice',
    'audio/ogg',
  ],
  [Buffer.from('GIF89a'), '', 'animation', 'image/gif'],
  [Buffer.from('ID3audio'), '', 'audio', 'audio/mpeg'],
  [Buffer.from('0000ftypM4A '), 'audio/mp4', 'audio', 'audio/mp4'],
  [Buffer.from('0000ftypisom'), 'video/mp4', 'video', 'video/mp4'],
  [Buffer.from([0xff, 0xf1, 0, 0]), 'audio/aac', 'document', 'audio/aac'],
])(
  'classifies compatible media and retains unsupported containers as documents',
  async (bytes, suppliedType, mediaType, type) => {
    jest
      .mocked(readFileStreamFromStorage)
      .mockResolvedValueOnce(Readable.from([bytes]));
    const [file] = await prepareTelegramReplyFiles('tenant', [
      { url: 'key', type: suppliedType },
    ]);
    expect(file).toMatchObject({ mediaType, type });
  },
);

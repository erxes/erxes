import type { IModels } from '~/connectionResolvers';
import { sendTelegramReply } from '../controller/sendMessage';
import { prepareTelegramReplyFiles } from '../utils/replyAttachments';
import {
  setTelegramWebhook,
  getTelegramFile,
  getTelegramResponse,
} from '../client';

jest.mock('../utils/replyAttachments', () => {
  const actual: typeof import('../utils/replyAttachments') = jest.requireActual(
    '../utils/replyAttachments',
  );
  return { ...actual, prepareTelegramReplyFiles: jest.fn() };
});
jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(),
  sanitizeFilename: (name: string) => name,
}));

const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
const originalFetch = global.fetch;
const token = '123:fake-test-token';
const bot = { token };
const conversation = {
  _id: 'local-chat',
  chatId: '-100123',
  chatType: 'supergroup',
  messageThreadId: 27,
};
const create = jest.fn().mockResolvedValue({ upsertedCount: 1 });
const integrationLookup = jest.fn().mockResolvedValue({ isActive: true });
// This cast is confined to the Mongoose test-double boundary; application code
// receives the real tenant-scoped IModels from generateModels.
const models = {
  Integrations: { findOne: integrationLookup },
  TelegramBots: {
    findOne: jest.fn(() => ({ select: jest.fn().mockResolvedValue(bot) })),
  },
  TelegramConversations: { findOne: jest.fn().mockResolvedValue(conversation) },
  TelegramConversationMessages: {
    updateOne: create,
    findOne: jest.fn().mockResolvedValue(null),
  },
} as unknown as IModels;
const payload = {
  integrationId: 'integration',
  conversationId: 'inbox-chat',
  userId: 'staff',
  content: '<p>Hello &amp; welcome</p>',
};
const accepted = (id = 5): Response =>
  new Response(
    JSON.stringify({
      ok: true,
      result: {
        message_id: id,
        date: 1_700_000_000,
        chat: { id: -100123, type: 'supergroup' },
        text: 'Hello & welcome',
      },
    }),
    { status: 200 },
  );

beforeAll(() => {
  global.fetch = fetchMock;
});
afterAll(() => {
  global.fetch = originalFetch;
});
beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  integrationLookup.mockResolvedValue({ isActive: true });
  create.mockResolvedValue({ upsertedCount: 1 });
  jest.mocked(prepareTelegramReplyFiles).mockResolvedValue([]);
  fetchMock.mockResolvedValue(accepted());
});

test('sends an inbox reply into the mapped group topic and returns provider IDs', async () => {
  const result = await sendTelegramReply({
    models,
    subdomain: 'tenant',
    payload,
  });
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
    chat_id: '-100123',
    message_thread_id: 27,
    text: 'Hello & welcome',
  });
  expect(result.data).toMatchObject({
    conversationId: 'inbox-chat',
    displayContent: payload.content,
    extraData: { telegram: { messageIds: ['5'] } },
  });
  expect(create).toHaveBeenCalledTimes(1);
});
test.each([
  [
    '<p>TG QA 04</p><p>plain &lt;b&gt;text&lt;/b&gt;</p><p>last paragraph ✅</p>',
    'TG QA 04\nplain <b>text</b>\nlast paragraph ✅',
  ],
  [
    '<p>&lt;script&gt;example&lt;/script&gt; &amp;lt;b&amp;gt; &amp;nbsp;</p>',
    '<script>example</script> &lt;b&gt; &nbsp;',
  ],
  ['<p><strong>bold</strong> &amp; &quot;quotes&quot;</p>', 'bold & "quotes"'],
])(
  'preserves literal editor text while removing actual markup',
  async (content, text) => {
    const result = await sendTelegramReply({
      models,
      subdomain: 'tenant',
      payload: { ...payload, content },
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).text).toBe(
      text,
    );
    expect(result.data.displayContent).toBe(content);
  },
);
test.each([
  { internal: true },
  { poll: {} },
  { replyToMessageId: '7' },
  { content: '' },
])('refuses unsupported or empty replies before sending %j', async (extra) => {
  await expect(
    sendTelegramReply({
      models,
      subdomain: 'tenant',
      payload: { ...payload, ...extra },
    }),
  ).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
});
test('blocks an archived integration', async () => {
  integrationLookup.mockResolvedValueOnce({ isActive: false });
  await expect(
    sendTelegramReply({ models, subdomain: 'tenant', payload }),
  ).rejects.toThrow('archived');
  expect(fetchMock).not.toHaveBeenCalled();
});
test('uploads photo/document multipart data with the caption on the first file', async () => {
  jest.mocked(prepareTelegramReplyFiles).mockResolvedValue([
    {
      bytes: Buffer.from('photo'),
      name: 'photo.jpg',
      type: 'image/jpeg',
      asPhoto: true,
      url: 'photo-key',
    },
    {
      bytes: Buffer.from('doc'),
      name: 'file.txt',
      type: 'text/plain',
      asPhoto: false,
      url: 'doc-key',
    },
  ]);
  fetchMock
    .mockResolvedValueOnce(accepted(6))
    .mockResolvedValueOnce(accepted(7));
  const result = await sendTelegramReply({
    models,
    subdomain: 'tenant',
    payload: {
      ...payload,
      attachments: [{ url: 'photo-key' }, { url: 'doc-key' }],
    },
  });
  const first = fetchMock.mock.calls[0];
  const second = fetchMock.mock.calls[1];
  expect(first[0]).toContain('/sendPhoto');
  expect(second[0]).toContain('/sendDocument');
  expect(first[1]?.headers).toBeUndefined();
  expect(first[1]?.body).toBeInstanceOf(FormData);
  const firstBody = first[1]?.body as FormData;
  const secondBody = second[1]?.body as FormData;
  expect(firstBody.get('caption')).toBe('Hello & welcome');
  expect(firstBody.get('message_thread_id')).toBe('27');
  expect(secondBody.get('caption')).toBeNull();
  expect(result.data.extraData.telegram.messageIds).toEqual(['6', '7']);
});
test('a preflight failure sends nothing and leaves the inbox mutation unsuccessful', async () => {
  jest
    .mocked(prepareTelegramReplyFiles)
    .mockRejectedValueOnce(new Error('storage failed'));
  await expect(
    sendTelegramReply({
      models,
      subdomain: 'tenant',
      payload: { ...payload, attachments: [{ url: 'bad' }] },
    }),
  ).rejects.toThrow('storage failed');
  expect(fetchMock).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
});
test('a partial provider send reports the accepted count without automatically retrying', async () => {
  jest.mocked(prepareTelegramReplyFiles).mockResolvedValue(
    Array.from({ length: 2 }, (_, index) => ({
      bytes: Buffer.from('x'),
      name: 'x.txt',
      type: 'text/plain',
      asPhoto: index === 0,
      url: 'key',
    })),
  );
  fetchMock
    .mockResolvedValueOnce(accepted())
    .mockResolvedValueOnce(new Response('{}', { status: 429 }));
  await expect(
    sendTelegramReply({
      models,
      subdomain: 'tenant',
      payload: { ...payload, attachments: [{ url: 'a' }, { url: 'b' }] },
    }),
  ).rejects.toThrow('1 attachment(s) were accepted');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(create).toHaveBeenCalledTimes(1);
});
test('a lost delivery response and a failed local write never suggest blind resend', async () => {
  fetchMock.mockRejectedValueOnce(new Error(`secret URL /bot${token}`));
  await expect(
    sendTelegramReply({ models, subdomain: 'tenant', payload }),
  ).rejects.toThrow('Check the chat');
  create.mockRejectedValueOnce(new Error('database down'));
  await expect(
    sendTelegramReply({ models, subdomain: 'tenant', payload }),
  ).rejects.toThrow('Telegram accepted');
});
test('webhook registration enables group messages and channel posts without dropping updates', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ ok: true, result: true })),
  );
  await setTelegramWebhook(
    token,
    'https://example.com/telegram/receive/bot',
    'secret',
  );
  expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
    allowed_updates: [
      'message',
      'channel_post',
      'edited_message',
      'edited_channel_post',
      'poll',
      'message_reaction',
      'message_reaction_count',
    ],
    drop_pending_updates: false,
    secret_token: 'secret',
  });
});
test('file lookup and transport errors do not expose the token', async () => {
  fetchMock.mockRejectedValueOnce(new Error(token));
  await expect(getTelegramFile(token, 'id')).rejects.toThrow(
    'Could not reach Telegram',
  );
  fetchMock.mockResolvedValueOnce(new Response('{}', { status: 403 }));
  await expect(getTelegramResponse(token, 'sendMessage', {})).rejects.toThrow(
    'permission',
  );
});

test('sends compatible uploads as one native album and records every provider message', async () => {
  jest.mocked(prepareTelegramReplyFiles).mockResolvedValue(
    Array.from({ length: 2 }, (_, index) => ({
      bytes: Buffer.from('jpeg'),
      name: `p${index}.jpg`,
      type: 'image/jpeg',
      asPhoto: true,
      mediaType: 'photo',
      url: `key${index}`,
    })),
  );
  const part = {
    date: 1700000000,
    chat: { id: -100123, type: 'supergroup' },
    media_group_id: 'album',
  };
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        ok: true,
        result: [
          { ...part, message_id: 10 },
          { ...part, message_id: 11 },
        ],
      }),
    ),
  );
  const result = await sendTelegramReply({
    models,
    subdomain: 'tenant',
    payload: { ...payload, attachments: [{ url: 'a' }, { url: 'b' }] },
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toContain('/sendMediaGroup');
  const form = fetchMock.mock.calls[0][1]?.body as FormData;
  expect(JSON.parse(String(form.get('media')))).toEqual([
    { type: 'photo', media: 'attach://file0', caption: 'Hello & welcome' },
    { type: 'photo', media: 'attach://file1' },
  ]);
  expect(result.data.extraData.telegram.messageIds).toEqual(['10', '11']);
  expect(create).toHaveBeenCalledTimes(2);
});
test('quoted replies resolve within the active integration, chat and topic', async () => {
  jest
    .mocked(models.TelegramConversationMessages.findOne)
    .mockResolvedValueOnce({
      messageId: '7',
      content: 'quoted',
      senderName: 'Alice',
    });
  const result = await sendTelegramReply({
    models,
    subdomain: 'tenant',
    payload: { ...payload, replyToMessageId: '7' },
  });
  expect(models.TelegramConversationMessages.findOne).toHaveBeenLastCalledWith({
    integrationId: 'integration',
    conversationId: 'local-chat',
    chatId: '-100123',
    messageId: '7',
  });
  expect(
    JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).reply_parameters,
  ).toEqual({ message_id: 7 });
  expect(result.data.extraData.telegram.replyTo?.content).toBe('quoted');
});
test('sends an anonymous native poll through the existing inbox poll contract', async () => {
  const poll = {
    id: 'poll1',
    question: 'Choose',
    options: [
      { text: 'A', voter_count: 0 },
      { text: 'B', voter_count: 0 },
    ],
    total_voter_count: 0,
    is_closed: false,
    is_anonymous: true,
    type: 'regular',
    allows_multiple_answers: false,
  };
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        ok: true,
        result: {
          message_id: 12,
          date: 1700000000,
          chat: { id: -100123, type: 'supergroup' },
          poll,
        },
      }),
    ),
  );
  const result = await sendTelegramReply({
    models,
    subdomain: 'tenant',
    payload: {
      ...payload,
      content: '',
      poll: {
        question: 'Choose',
        options: ['A', 'B'],
        duration: 24,
        allowMultiselect: false,
      },
    },
  });
  expect(fetchMock.mock.calls[0][0]).toContain('/sendPoll');
  expect(result.data.extraData.poll?.question).toBe('Choose');
  expect(result.data.content).toBe('Choose');
});

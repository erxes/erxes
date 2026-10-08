import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationDocument } from '../@types/conversations';
import type { ITelegramConversationMessageDocument } from '../@types/conversationMessages';
import { getOrCreateMessage } from '../controller/store';
import { storeTelegramAttachment } from '../utils/attachments';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { telegramMessageSchema } from '../utils/message';
import { telegramTextToHtml } from '../utils/content';

jest.mock('../utils/attachments', () => ({
  storeTelegramAttachment: jest.fn(),
}));
jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));

const conversation = {
  _id: 'local-chat',
  integrationId: 'integration',
  erxesApiId: 'inbox-chat',
  chatType: 'channel',
  chatId: '-123',
  messageThreadId: 0,
} as ITelegramConversationDocument;
const message = telegramMessageSchema.parse({
  message_id: 7,
  date: 1_700_000_000,
  chat: { id: -123, type: 'channel', title: 'News' },
  sender_chat: { id: -123, type: 'channel', title: 'News' },
  caption: '<caption>',
  document: { file_id: 'file', file_unique_id: 'f', file_name: 'file.txt' },
});
const attachment = {
  url: 'workspace-key',
  name: 'file.txt',
  type: 'text/plain',
  size: 3,
};
let stored: ITelegramConversationMessageDocument;
let canonical: { _id: string; conversationId: string } | null;
let crashAfterInsert = false;
const findOneAndUpdate = jest.fn(
  (
    filter: { processingToken?: string; erxesApiId?: null },
    update: { $set: Partial<ITelegramConversationMessageDocument> },
  ) => {
    if (
      filter.erxesApiId === null &&
      (stored.erxesApiId || stored.processingToken)
    )
      return Promise.resolve(null);
    if (
      filter.processingToken &&
      filter.processingToken !== stored.processingToken
    )
      return Promise.resolve(null);
    Object.assign(stored, update.$set);
    return Promise.resolve(stored);
  },
);
const models = {
  TelegramConversationMessages: {
    updateOne: jest.fn(
      (_filter: unknown, update: { $unset?: { processingToken?: string } }) => {
        if (update.$unset) {
          delete stored.processingToken;
          delete stored.processingUntil;
        }
        return Promise.resolve({ upsertedCount: 1, matchedCount: 1 });
      },
    ),
    getMessage: jest.fn(() => Promise.resolve(stored)),
    findOneAndUpdate,
  },
  TelegramReactions: { exists: jest.fn().mockResolvedValue(null) },
  TelegramBots: {
    findOne: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ token: '123:fake' }),
    })),
  },
  ConversationMessages: { findOne: jest.fn(() => Promise.resolve(canonical)) },
  Conversations: { updateConversation: jest.fn().mockResolvedValue({}) },
} as unknown as IModels;
const run = () => getOrCreateMessage(models, 'tenant-a', conversation, message);
beforeEach(() => {
  jest.clearAllMocks();
  stored = {
    _id: 'local-message',
    integrationId: 'integration',
    conversationId: 'local-chat',
    chatId: '-123',
    messageId: '7',
    content: '<caption>',
    senderName: 'News',
    createdAt: new Date(1_700_000_000_000),
    attachments: [],
  } as unknown as ITelegramConversationMessageDocument;
  canonical = null;
  crashAfterInsert = false;
  jest.mocked(storeTelegramAttachment).mockResolvedValue(attachment);
  jest.mocked(receiveInboxMessage).mockImplementation((_tenant, event) => {
    const data = JSON.parse(event.payload);
    canonical = { _id: data._id, conversationId: data.conversationId };
    if (crashAfterInsert)
      return Promise.reject(new Error('process failed after insert'));
    return Promise.resolve({ status: 'success', data: { _id: data._id } });
  });
});
test('stores media once, escapes text, uses existing attachment shape and deduplicates redelivery', async () => {
  const first = await run();
  expect(first.erxesApiId).toBe('telegram-local-message');
  const data = JSON.parse(
    jest.mocked(receiveInboxMessage).mock.calls[0][1].payload,
  );
  expect(data).toMatchObject({
    _id: 'telegram-local-message',
    conversationId: 'inbox-chat',
    content: '&lt;caption&gt;',
    attachments: [attachment],
    extraData: { telegram: { chatType: 'channel', senderName: 'News' } },
  });
  expect(storeTelegramAttachment).toHaveBeenCalledWith(
    expect.objectContaining({ subdomain: 'tenant-a', fileId: 'file' }),
  );
  await run();
  expect(storeTelegramAttachment).toHaveBeenCalledTimes(1);
  expect(receiveInboxMessage).toHaveBeenCalledTimes(1);
  expect(stored.processingToken).toBeUndefined();
});
test.each([false, true])(
  'sets the preview for captionless media before publishing, including crash recovery (%s)',
  async (recover) => {
    crashAfterInsert = recover;
    const incoming = { ...message, caption: undefined };
    if (recover) {
      await expect(
        getOrCreateMessage(models, 'tenant-a', conversation, incoming),
      ).rejects.toThrow('process failed');
      jest.mocked(models.Conversations.updateConversation).mockClear();
    }
    await getOrCreateMessage(models, 'tenant-a', conversation, incoming);
    expect(models.Conversations.updateConversation).toHaveBeenCalledWith(
      'inbox-chat',
      expect.objectContaining({ content: 'file.txt' }),
    );
    expect(stored.content).toBe('');
    const data: { content: string; attachments: unknown[] } = JSON.parse(
      jest.mocked(receiveInboxMessage).mock.calls[0][1].payload,
    );
    expect(data).toMatchObject({ content: '', attachments: [attachment] });
    if (!recover) {
      expect(
        jest.mocked(models.Conversations.updateConversation).mock
          .invocationCallOrder[0],
      ).toBeLessThan(
        jest.mocked(receiveInboxMessage).mock.invocationCallOrder[0],
      );
    }
  },
);
test('updates the list preview for a poll without duplicating its question in the bubble', async () => {
  const incoming = telegramMessageSchema.parse({
    ...message,
    caption: undefined,
    document: undefined,
    poll: {
      id: 'poll',
      question: '<Lunch?>',
      options: [],
      total_voter_count: 0,
      is_closed: false,
      is_anonymous: true,
      type: 'regular',
      allows_multiple_answers: false,
    },
  });
  await getOrCreateMessage(models, 'tenant-a', conversation, incoming);
  expect(models.Conversations.updateConversation).toHaveBeenCalledWith(
    'inbox-chat',
    { content: '&lt;Lunch?&gt;' },
  );
  expect(stored.content).toBe('');
  expect(stored.poll?.question).toBe('<Lunch?>');
});
test.each(['text', 'caption'] as const)(
  'keeps the entire incoming %s without applying outbound length limits',
  async (field) => {
    const content = `${'Текст 😀 & <example>\n'.repeat(500)}last character!`;
    const incoming = telegramMessageSchema.parse({
      ...message,
      caption: undefined,
      document: field === 'caption' ? message.document : undefined,
      [field]: content,
    });
    await getOrCreateMessage(models, 'tenant-a', conversation, incoming);
    const data: { content: string } = JSON.parse(
      jest.mocked(receiveInboxMessage).mock.calls[0][1].payload,
    );
    expect(stored.content).toBe(content);
    expect(data.content).toBe(telegramTextToHtml(content));
  },
);
test('concurrent webhook retries cannot upload or insert a second copy', async () => {
  let release: () => void = () => undefined;
  let notifyStarted: () => void = () => undefined;
  const started = new Promise<void>((resolve) => {
    notifyStarted = resolve;
  });
  const pending = new Promise<typeof attachment>((resolve) => {
    release = () => resolve(attachment);
  });
  jest.mocked(storeTelegramAttachment).mockImplementationOnce(() => {
    notifyStarted();
    return pending;
  });
  const first = run();
  await started;
  await expect(run()).rejects.toThrow('still being processed');
  release();
  await first;
  expect(storeTelegramAttachment).toHaveBeenCalledTimes(1);
  expect(receiveInboxMessage).toHaveBeenCalledTimes(1);
});
test('a retry repairs a post-insert crash without reuploading or duplicating the canonical message', async () => {
  crashAfterInsert = true;
  await expect(run()).rejects.toThrow('process failed');
  expect(stored.erxesApiId).toBeUndefined();
  await run();
  expect(receiveInboxMessage).toHaveBeenCalledTimes(1);
  expect(storeTelegramAttachment).toHaveBeenCalledTimes(1);
  expect(pConversationClientMessageInserted).toHaveBeenCalledTimes(1);
  expect(stored.erxesApiId).toBe('telegram-local-message');
});
test('storage failure leaves a retryable message and releases its lease', async () => {
  jest
    .mocked(storeTelegramAttachment)
    .mockRejectedValueOnce(new Error('storage down'));
  await expect(run()).rejects.toThrow('storage down');
  expect(stored.processingToken).toBeUndefined();
  expect(receiveInboxMessage).not.toHaveBeenCalled();
  await run();
  expect(stored.erxesApiId).toBe('telegram-local-message');
});

test('a file limit discovered during download is shown in the inbox instead of being retried forever', async () => {
  const { TelegramFileTooLargeError } = await import('../utils/fileLimits');
  jest
    .mocked(storeTelegramAttachment)
    .mockRejectedValueOnce(new TelegramFileTooLargeError());
  await run();
  const data = JSON.parse(
    jest.mocked(receiveInboxMessage).mock.calls[0][1].payload,
  );
  expect(data.content).toContain('20 MB download limit');
  expect(stored.erxesApiId).toBe('telegram-local-message');
  await run();
  expect(storeTelegramAttachment).toHaveBeenCalledTimes(1);
});

test('an upgraded group reuses the old history through its alias without rewriting unique chat keys', async () => {
  const { getOrCreateTelegramConversation } =
    await import('../controller/store');
  const old = { ...conversation, chatId: '-123', migratedToChatId: '-100123' };
  const find = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(old);
  const update = jest.fn().mockResolvedValue(old);
  const scopedModels = {
    ...models,
    TelegramConversations: { findOne: find, findOneAndUpdate: update },
  } as unknown as IModels;
  const upgraded = telegramMessageSchema.parse({
    ...message,
    chat: { id: -100123, type: 'supergroup', title: 'Renamed' },
  });
  const result = await getOrCreateTelegramConversation(
    scopedModels,
    'integration',
    upgraded,
  );
  expect(result.conversation._id).toBe(old._id);
  expect(find).toHaveBeenLastCalledWith({
    integrationId: 'integration',
    migratedToChatId: '-100123',
    messageThreadId: 0,
  });
  expect(update).toHaveBeenCalledWith(
    { _id: old._id },
    { $set: { chatTitle: 'Renamed', chatType: 'supergroup' } },
    { new: true, runValidators: true },
  );
});
test('a conversation already created at the upgraded ID wins without merging separate histories', async () => {
  const { getOrCreateTelegramConversation } =
    await import('../controller/store');
  const existing = { ...conversation, _id: 'new-history', chatId: '-100123' };
  const find = jest.fn().mockResolvedValue(existing);
  const scopedModels = {
    ...models,
    TelegramConversations: {
      findOne: find,
      findOneAndUpdate: jest.fn().mockResolvedValue(existing),
    },
  } as unknown as IModels;
  const result = await getOrCreateTelegramConversation(
    scopedModels,
    'integration',
    message,
  );
  expect(result.conversation._id).toBe('new-history');
  expect(find).toHaveBeenCalledTimes(1);
});

import type { IModels } from '~/connectionResolvers';
import type { ITelegramConversationDocument } from '../@types/conversations';
import type { ITelegramConversationMessageDocument } from '../@types/conversationMessages';
import { getOrCreateMessage } from '../controller/store';
import { storeTelegramAttachment } from '../utils/attachments';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { telegramMessageSchema } from '../utils/message';

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
  async (
    filter: { processingToken?: string; erxesApiId?: null },
    update: { $set: Partial<ITelegramConversationMessageDocument> },
  ) => {
    if (
      filter.erxesApiId === null &&
      (stored.erxesApiId || stored.processingToken)
    )
      return null;
    if (
      filter.processingToken &&
      filter.processingToken !== stored.processingToken
    )
      return null;
    Object.assign(stored, update.$set);
    return stored;
  },
);
const models = {
  TelegramConversationMessages: {
    updateOne: jest.fn(
      async (
        _filter: unknown,
        update: { $unset?: { processingToken?: string } },
      ) => {
        if (update.$unset) {
          delete stored.processingToken;
          delete stored.processingUntil;
        }
        return { upsertedCount: 1, matchedCount: 1 };
      },
    ),
    getMessage: jest.fn(async () => stored),
    findOneAndUpdate,
  },
  TelegramReactions: { exists: jest.fn().mockResolvedValue(null) },
  TelegramBots: {
    findOne: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ token: '123:fake' }),
    })),
  },
  ConversationMessages: { findOne: jest.fn(async () => canonical) },
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
  jest
    .mocked(receiveInboxMessage)
    .mockImplementation(async (_tenant, event) => {
      const data = JSON.parse(event.payload);
      canonical = { _id: data._id, conversationId: data.conversationId };
      if (crashAfterInsert) throw new Error('process failed after insert');
      return { status: 'success', data: { _id: data._id } };
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

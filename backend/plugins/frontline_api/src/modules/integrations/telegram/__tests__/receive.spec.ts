import type { IModels } from '~/connectionResolvers';
import type { ITelegramBotDocument } from '../@types/bot';
import { receiveTelegramMessage } from '../controller/receiveMessage';
import {
  getOrCreateCustomer,
  getOrCreateConversation,
  getOrCreateMessage,
} from '../controller/store';

jest.mock('../controller/store', () => ({
  getOrCreateCustomer: jest.fn(),
  getOrCreateConversation: jest.fn(),
  getOrCreateMessage: jest.fn(),
}));
const models = {
  Integrations: { findOne: jest.fn().mockResolvedValue({ isActive: true }) },
  TelegramConversations: {
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
} as unknown as IModels;
const bot = {
  _id: 'bot',
  botId: '999',
  erxesApiId: 'integration',
} as ITelegramBotDocument;
const sender = { id: 123, is_bot: false, first_name: 'Alice' };
const base = {
  message_id: 42,
  date: 1_700_000_000,
  from: sender,
  chat: { id: 123, type: 'private' },
  text: 'hello',
};
const receive = (extra: Record<string, unknown> = {}) =>
  receiveTelegramMessage({
    models,
    subdomain: 'tenant',
    bot,
    payload: { ...base, ...extra },
  });
beforeEach(() => {
  jest.clearAllMocks();
});

test.each(['private', 'group', 'supergroup'])(
  'imports human %s messages through the existing inbox bridge',
  async (type) => {
    await receive({
      chat: { id: type === 'private' ? 123 : -123, type, title: type },
    });
    expect(getOrCreateCustomer).toHaveBeenCalledWith(
      models,
      'tenant',
      'integration',
      sender,
    );
    expect(getOrCreateConversation).toHaveBeenCalledTimes(1);
    expect(getOrCreateMessage).toHaveBeenCalledTimes(1);
  },
);
test('channel and anonymous-admin posts never create a fake human contact', async () => {
  await receive({
    chat: { id: -123, type: 'channel', title: 'News' },
    from: undefined,
    sender_chat: { id: -123, type: 'channel', title: 'News' },
  });
  expect(getOrCreateCustomer).not.toHaveBeenCalled();
  expect(getOrCreateConversation).toHaveBeenCalled();
  await receive({
    chat: { id: -123, type: 'supergroup' },
    from: { ...sender, is_bot: true },
    sender_chat: { id: -123, type: 'supergroup', title: 'Anonymous admin' },
  });
  expect(getOrCreateCustomer).not.toHaveBeenCalled();
});
test('imports attachment-only messages and group forum topics', async () => {
  await receive({
    text: undefined,
    document: { file_id: 'file', file_unique_id: 'f' },
    chat: { id: -1, type: 'supergroup' },
    message_thread_id: 5,
    is_topic_message: true,
  });
  expect(getOrCreateMessage).toHaveBeenCalledTimes(1);
});
test.each([
  { business_connection_id: 'business' },
  { guest_query_id: 'guest' },
  { direct_messages_topic: {} },
  { from: { ...sender, id: 999, is_bot: true } },
  { message_id: 0 },
])(
  'acknowledges unsupported events without creating messages %j',
  async (extra) => {
    await expect(receive(extra)).resolves.toBeNull();
    expect(getOrCreateMessage).not.toHaveBeenCalled();
  },
);
test('migrated group messages route future replies to the supergroup', async () => {
  await receive({
    chat: { id: -123, type: 'group' },
    migrate_to_chat_id: -100123,
  });
  expect(models.TelegramConversations.updateMany).toHaveBeenCalledWith(
    { integrationId: 'integration', chatId: '-123' },
    { $set: { migratedToChatId: '-100123', chatType: 'supergroup' } },
  );
  expect(getOrCreateMessage).toHaveBeenCalled();
});
test('malformed provider content fails validation before persistence', async () => {
  await expect(
    receive({ photo: [{ file_id: 'x', width: 'bad' }] }),
  ).rejects.toThrow();
  expect(getOrCreateMessage).not.toHaveBeenCalled();
});

test('imports unsupported content as a notice and other bots without fake human contacts', async () => {
  await receive({ text: undefined, future_message_type: {} });
  expect(getOrCreateMessage).toHaveBeenCalledTimes(1);
  jest.clearAllMocks();
  await receive({ from: { ...sender, is_bot: true } });
  expect(getOrCreateMessage).toHaveBeenCalledTimes(1);
  expect(getOrCreateCustomer).not.toHaveBeenCalled();
});

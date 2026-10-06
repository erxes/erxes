import type { IContext, IModels } from '~/connectionResolvers';
import { generateModels } from '~/connectionResolvers';
import { telegramRemoveIntegration } from '../messageBroker';
import {
  loadTelegramBotClass,
  type ITelegramBotModel,
} from '../db/models/Bots';
import {
  getTelegramBot,
  setTelegramWebhook,
  deleteTelegramWebhook,
} from '../client';
import { telegramMutations } from '../graphql/resolvers/mutations';
import { telegramQueries } from '../graphql/resolvers/queries';
import { visibleChannelsFilter } from '@/channel/utils';

jest.mock('../client', () => ({
  getTelegramBot: jest.fn(),
  getTelegramWebhookInfo: jest.fn(),
  setTelegramWebhook: jest.fn(),
  deleteTelegramWebhook: jest.fn(),
}));
jest.mock('@/channel/utils', () => ({ visibleChannelsFilter: jest.fn() }));
jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('../controller/sendMessage', () => ({
  sendTelegramReply: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  mongooseStringRandomId: { type: String },
}));
const bot = {
  _id: 'saved-bot',
  botId: '123',
  erxesApiId: 'integration',
  token: '123:fake',
  webhookSecret: 'secret',
};
const select = jest.fn().mockResolvedValue(bot);
const updateBot = jest.fn().mockResolvedValue({ modifiedCount: 1 });
const updateIntegration = jest.fn().mockResolvedValue({ modifiedCount: 1 });
const findChats = jest.fn(() => ({
  lean: jest
    .fn()
    .mockResolvedValue([
      { erxesApiId: 'inbox-chat', chatId: '-123', chatType: 'group' },
    ]),
}));
const models = {
  TelegramBots: {
    findOne: jest.fn(() => ({ select })),
    updateOne: updateBot,
    getBot: jest.fn().mockResolvedValue({ _id: bot._id, botId: '123' }),
  },
  Integrations: {
    updateOne: updateIntegration,
    find: jest.fn(() => ({
      distinct: jest.fn().mockResolvedValue(['allowed-integration']),
    })),
  },
  Channels: {
    find: jest.fn(() => ({
      distinct: jest.fn().mockResolvedValue(['allowed-channel']),
    })),
  },
  TelegramConversations: { find: findChats },
} as unknown as IModels;
const methods = loadTelegramBotClass(models).statics as unknown as Pick<
  ITelegramBotModel,
  'setWebhook' | 'updateBot' | 'disconnectBot'
>;
const checkPermission = jest.fn().mockImplementation(() => Promise.resolve());
const context = {
  models,
  subdomain: 'tenant-a',
  user: { _id: 'staff' },
  checkPermission,
} as unknown as IContext;
beforeEach(() => {
  jest.clearAllMocks();
  select.mockResolvedValue(bot);
  jest.mocked(getTelegramBot).mockResolvedValue({
    id: 123,
    is_bot: true,
    first_name: 'Bot',
    can_join_groups: true,
  });
  jest.mocked(setTelegramWebhook).mockResolvedValue(true);
  jest.mocked(deleteTelegramWebhook).mockResolvedValue(true);
  jest.mocked(visibleChannelsFilter).mockResolvedValue({ memberIds: 'staff' });
  jest.mocked(generateModels).mockResolvedValue(models);
});
test('reconnect validates the callback before contacting Telegram and activates only after registration', async () => {
  await expect(
    methods.setWebhook(bot._id, 'https://example.com/wrong'),
  ).rejects.toThrow('must end');
  expect(setTelegramWebhook).not.toHaveBeenCalled();
  jest
    .mocked(setTelegramWebhook)
    .mockRejectedValueOnce(new Error('provider unavailable'));
  await expect(
    methods.setWebhook(
      bot._id,
      `https://example.com/telegram/receive/${bot._id}`,
    ),
  ).rejects.toThrow('provider unavailable');
  expect(updateIntegration).not.toHaveBeenCalled();
  await methods.setWebhook(
    bot._id,
    `https://example.com/telegram/receive/${bot._id}`,
  );
  expect(updateIntegration).toHaveBeenCalledWith(
    { _id: 'integration' },
    { $set: { isActive: true } },
  );
});
test('token replacement must identify the same bot and returns credential-free metadata', async () => {
  jest
    .mocked(getTelegramBot)
    .mockResolvedValueOnce({ id: 999, is_bot: true, first_name: 'Other' });
  await expect(methods.updateBot(bot._id, '999:fake')).rejects.toThrow(
    'same Telegram bot',
  );
  expect(updateBot).not.toHaveBeenCalled();
  const result = await methods.updateBot(bot._id, '123:replacement');
  expect(updateBot).toHaveBeenCalledWith(
    { _id: bot._id },
    expect.objectContaining({
      $set: expect.objectContaining({ token: '123:replacement' }),
    }),
    { runValidators: true },
  );
  expect(result).not.toHaveProperty('token');
});
test('disconnect preserves mapping/history while pausing provider delivery and inbox replies', async () => {
  await expect(methods.disconnectBot(bot._id)).resolves.toBe(true);
  expect(deleteTelegramWebhook).toHaveBeenCalledWith(bot.token);
  expect(updateIntegration).toHaveBeenCalledWith(
    { _id: 'integration' },
    { $set: { isActive: false } },
  );
  expect(updateBot).not.toHaveBeenCalled();
  expect(updateIntegration.mock.invocationCallOrder[0]).toBeLessThan(
    jest.mocked(deleteTelegramWebhook).mock.invocationCallOrder[0],
  );
});
test.each(['revoked token', 'network unavailable'])(
  'disconnect still deactivates locally when webhook cleanup fails: %s',
  async (reason) => {
    jest.mocked(deleteTelegramWebhook).mockRejectedValueOnce(new Error(reason));
    await expect(methods.disconnectBot(bot._id)).resolves.toBe(false);
    expect(updateIntegration).toHaveBeenCalledWith(
      { _id: 'integration' },
      { $set: { isActive: false } },
    );
    expect(updateBot).not.toHaveBeenCalled();
  },
);
test('a failed local disconnect does not remove the provider webhook', async () => {
  updateIntegration.mockRejectedValueOnce(new Error('database unavailable'));
  await expect(methods.disconnectBot(bot._id)).rejects.toThrow(
    'database unavailable',
  );
  expect(deleteTelegramWebhook).not.toHaveBeenCalled();
});
test.each([true, false])(
  'removal unlinks and invalidates the secret before best-effort provider cleanup (available: %s)',
  async (available) => {
    if (!available)
      jest
        .mocked(deleteTelegramWebhook)
        .mockRejectedValueOnce(new Error('revoked token'));
    await expect(
      telegramRemoveIntegration({
        subdomain: 'tenant-a',
        data: { integrationId: 'integration' },
      }),
    ).resolves.toBeUndefined();
    expect(generateModels).toHaveBeenCalledWith('tenant-a');
    expect(updateBot).toHaveBeenCalledWith(
      { _id: bot._id, erxesApiId: 'integration' },
      {
        $unset: { erxesApiId: '' },
        $set: { webhookSecret: expect.stringMatching(/^[a-f0-9]{64}$/) },
      },
    );
    expect(updateBot.mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(deleteTelegramWebhook).mock.invocationCallOrder[0],
    );
    expect(deleteTelegramWebhook).toHaveBeenCalledWith(bot.token, true);
  },
);
test('a failed local unlink does not remove the provider webhook', async () => {
  updateBot.mockRejectedValueOnce(new Error('database unavailable'));
  await expect(
    telegramRemoveIntegration({
      subdomain: 'tenant-a',
      data: { integrationId: 'integration' },
    }),
  ).rejects.toThrow('database unavailable');
  expect(deleteTelegramWebhook).not.toHaveBeenCalled();
});
test('setup mutations reject permission failure before accessing credentials or provider methods', async () => {
  for (const run of [
    () =>
      telegramMutations.telegramUpdateBot(undefined, { _id: bot._id }, context),
    () =>
      telegramMutations.telegramDisconnectBot(
        undefined,
        { _id: bot._id },
        context,
      ),
    () =>
      telegramMutations.telegramSetWebhook(
        undefined,
        { _id: bot._id, url: 'https://example.com' },
        context,
      ),
  ]) {
    checkPermission.mockRejectedValueOnce(new Error('denied'));
    await expect(run()).rejects.toThrow('denied');
  }
  expect(select).not.toHaveBeenCalled();
});
test('chat metadata restricts results to the acting user visible channel integrations', async () => {
  const result = await telegramQueries.telegramConversationChats(
    undefined,
    { conversationIds: ['inbox-chat'] },
    context,
  );
  expect(checkPermission).toHaveBeenCalledWith('showConversations');
  expect(visibleChannelsFilter).toHaveBeenCalledWith({
    models,
    subdomain: 'tenant-a',
    user: context.user,
  });
  expect(models.Integrations.find).toHaveBeenCalledWith({
    kind: 'telegram-messenger',
    channelId: { $in: ['allowed-channel'] },
  });
  expect(findChats).toHaveBeenCalledWith({
    erxesApiId: { $in: ['inbox-chat'] },
    integrationId: { $in: ['allowed-integration'] },
  });
  expect(result[0].conversationId).toBe('inbox-chat');
  await expect(
    telegramQueries.telegramConversationChats(
      undefined,
      { conversationIds: Array(101).fill('id') },
      context,
    ),
  ).rejects.toThrow();
  checkPermission.mockRejectedValueOnce(new Error('denied'));
  await expect(
    telegramQueries.telegramConversationChats(
      undefined,
      { conversationIds: ['secret'] },
      context,
    ),
  ).rejects.toThrow('denied');
  expect(findChats).toHaveBeenCalledTimes(1);
});

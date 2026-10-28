import type { IContext } from '~/connectionResolvers';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { visibleChannelsFilter } from '@/channel/utils';

jest.mock('~/connectionResolvers', () => ({}));
jest.mock('@/integrations/facebook/commonUtils', () => ({}));
jest.mock('@/channel/utils', () => ({ visibleChannelsFilter: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ markResolvers: jest.fn() }));

const integrations = [
  { _id: 'telegram-integration', kind: 'telegram-messenger' },
  { _id: 'discord-integration', kind: 'discord-messenger' },
];
const findIntegrations = jest.fn(({ kind }: { kind: string }) => ({
  countDocuments: () =>
    Promise.resolve(integrations.filter((item) => item.kind === kind).length),
}));
const find = jest.fn(() => ({
  lean: jest.fn().mockResolvedValue(integrations),
}));
const findChannels = jest.fn(() => ({
  distinct: jest.fn().mockResolvedValue(['visible-channel']),
}));
const aggregate = jest.fn();
// Only persistence and visibility are mocked; both resolvers use the real kind map.
const context = {
  subdomain: 'tenant-a',
  user: { _id: 'staff' },
  models: {
    Integrations: { findIntegrations, find },
    Channels: { find: findChannels },
    Conversations: { aggregate },
  },
} as unknown as IContext;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(visibleChannelsFilter).mockResolvedValue({ memberIds: 'staff' });
  aggregate
    .mockResolvedValueOnce([
      { _id: 'telegram-integration', count: 4 },
      { _id: 'discord-integration', count: 2 },
    ])
    .mockResolvedValueOnce([{ _id: 'telegram-integration', count: 3 }]);
});

test('used integration types include Telegram and preserve existing providers', async () => {
  await expect(
    integrationQueries.integrationsGetUsedTypes(undefined, {}, context),
  ).resolves.toEqual([
    { _id: 'discord-messenger', name: 'Discord' },
    { _id: 'telegram-messenger', name: 'Telegram' },
  ]);
});

test.each(['personal', 'team'])(
  'Telegram appears with scoped unread counts in %s inboxes',
  async (scope) => {
    await expect(
      integrationQueries.integrationsGetUsedTypesByChannel(
        undefined,
        { channelId: 'visible-channel', scope },
        context,
      ),
    ).resolves.toEqual([
      {
        _id: 'telegram-messenger',
        name: 'Telegram',
        conversationCount: 4,
        unreadConversationCount: 3,
      },
      {
        _id: 'discord-messenger',
        name: 'Discord',
        conversationCount: 2,
        unreadConversationCount: 0,
      },
    ]);
    expect(visibleChannelsFilter).toHaveBeenCalledWith({
      models: context.models,
      subdomain: 'tenant-a',
      user: context.user,
    });
    expect(findChannels).toHaveBeenCalledWith({
      $and: [
        { memberIds: 'staff' },
        { _id: 'visible-channel' },
        { scope: scope === 'team' ? { $in: ['team', null] } : scope },
      ],
    });
    expect(find).toHaveBeenCalledWith(
      { channelId: { $in: ['visible-channel'] }, isActive: { $ne: false } },
      { kind: 1 },
    );
    expect(aggregate.mock.calls[1][0][0].$match).toMatchObject({
      integrationId: { $in: ['telegram-integration', 'discord-integration'] },
      readUserIds: { $ne: 'staff' },
    });
  },
);

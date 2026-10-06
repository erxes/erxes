import {
  connectDiscordToken,
  disconnectDiscordToken,
} from '@/integrations/discord/services/gateway/connection';
import {
  connectGateway,
  type DiscordGatewayConnection,
} from '@/integrations/discord/gatewayClient';
import {
  connections,
  connectionKey,
  ownedSubdomains,
  ownedTokens,
} from '@/integrations/discord/state/gateway';

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(() =>
    Promise.resolve({
      DiscordBots: {
        findOne: jest
          .fn()
          .mockResolvedValue({
            applicationId: 'bot',
            erxesApiId: 'integration',
          }),
      },
    }),
  ),
}));
jest.mock('@/integrations/discord/gatewayClient', () => ({
  connectGateway: jest.fn(),
}));
jest.mock('@/integrations/discord/debuggers', () => ({
  debugError: jest.fn(),
  debugDiscord: jest.fn(),
}));
jest.mock('@/integrations/discord/controller/receiveMessage', () => ({
  receiveDiscordMessage: jest.fn(),
}));
jest.mock('@/integrations/discord/controller/receiveMessageUpdates', () => ({
  receiveDiscordMessageDelete: jest.fn(),
  receiveDiscordMessageEdit: jest.fn(),
}));
jest.mock('@/integrations/discord/controller/receiveActivityEvents', () => ({
  receiveDiscordPollVote: jest.fn(),
  receiveDiscordTyping: jest.fn(),
}));
jest.mock('@/integrations/discord/controller/receiveReactions', () => ({
  receiveDiscordReaction: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/channels', () => ({
  getChannel: jest.fn(),
  isThreadChannel: jest.fn(),
}));
jest.mock('@/integrations/discord/backfill', () => ({
  backfillChannelHistory: jest.fn(),
}));

afterEach(() => {
  connections.clear();
  ownedSubdomains.clear();
  ownedTokens.clear();
  jest.clearAllMocks();
});

it('destroys a late duplicate gateway and preserves the connection owned by teardown', async () => {
  const resolvers: Array<(connection: DiscordGatewayConnection) => void> = [];
  let markStarted: () => void = () => undefined;
  const bothStarted = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  jest.mocked(connectGateway).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolvers.push(resolve);
        if (resolvers.length === 2) markStarted();
      }),
  );
  ownedSubdomains.add('test');
  const first = connectDiscordToken('test', 'token');
  const second = connectDiscordToken('test', 'token');
  await bothStarted;
  const winner = {
    destroy: jest.fn(() => Promise.resolve()),
  } as unknown as DiscordGatewayConnection;
  const duplicate = {
    destroy: jest.fn(() => Promise.resolve()),
  } as unknown as DiscordGatewayConnection;
  resolvers[0](winner);
  await first;
  resolvers[1](duplicate);
  await second;
  expect(connections.get(connectionKey('test', 'token'))).toBe(winner);
  expect(duplicate.destroy).toHaveBeenCalledTimes(1);
  expect(winner.destroy).not.toHaveBeenCalled();
  await disconnectDiscordToken('test', 'token');
  expect(winner.destroy).toHaveBeenCalledTimes(1);
  expect(connections.size).toBe(0);
});

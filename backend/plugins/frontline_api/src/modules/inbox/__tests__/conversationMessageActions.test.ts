import { conversationMessageActionMutations } from '@/inbox/graphql/resolvers/mutations/conversationMessageActions';
import { dispatchConversationToService } from '@/inbox/graphql/resolvers/mutations/conversationAutomation';
import type { IContext } from '~/connectionResolvers';

jest.mock('@/inbox/graphql/resolvers/mutations/conversationAutomation', () => ({
  dispatchConversationToService: jest.fn(),
}));
jest.mock('@/inbox/services/conversationReaction', () => ({
  reactToConversationMessage: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

it('rejects a typing action when the actor lacks message permissions', async () => {
  const context = {
    checkPermission: jest
      .fn()
      .mockRejectedValue(new Error('Permission denied')),
    user: { _id: 'agent' },
    subdomain: 'test',
    models: {},
  } as unknown as IContext;
  await expect(
    conversationMessageActionMutations.conversationAgentTyping(
      undefined,
      { conversationId: 'inbox' },
      context,
    ),
  ).rejects.toThrow('Permission denied');
  expect(dispatchConversationToService).not.toHaveBeenCalled();
});

it("rejects typing for a conversation outside the actor's channels", async () => {
  const context = {
    checkPermission: jest.fn().mockImplementation(() => Promise.resolve()),
    user: { _id: 'agent' },
    subdomain: 'test',
    models: {
      Conversations: {
        getConversation: jest
          .fn()
          .mockResolvedValue({ integrationId: 'private-integration' }),
      },
      ChannelMembers: {
        find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })),
      },
      Integrations: {
        findOne: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(null) })),
      },
    },
  } as unknown as IContext;
  await expect(
    conversationMessageActionMutations.conversationAgentTyping(
      undefined,
      { conversationId: 'inbox' },
      context,
    ),
  ).rejects.toThrow('permission to access this conversation');
  expect(dispatchConversationToService).not.toHaveBeenCalled();
});

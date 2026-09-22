import { visibleChannelsFilter } from '@/channel/utils';
import { handleFacebookReaction } from '@/integrations/facebook/handleFacebookMessage';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { reactToConversationMessage } from '../conversationReaction';

jest.mock('@/channel/utils', () => ({ visibleChannelsFilter: jest.fn() }));
jest.mock('@/integrations/facebook/handleFacebookMessage', () => ({
  handleFacebookReaction: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
}));

describe('Facebook conversation reactions', () => {
  const args = {
    conversationId: 'conversation',
    messageId: 'facebook-mid',
    reaction: 'love',
  };
  const checkPermission = jest.fn();
  const exists = jest.fn();
  const getIntegration = jest.fn();
  const context = {
    user: { _id: 'agent' },
    subdomain: 'test',
    checkPermission,
    models: {
      Conversations: {
        getConversation: jest.fn().mockResolvedValue({
          _id: 'conversation',
          integrationId: 'integration',
          channelId: 'channel',
        }),
      },
      Integrations: { getIntegration },
      Channels: { exists },
    },
  } as unknown as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    checkPermission.mockResolvedValue(undefined);
    exists.mockResolvedValue({ _id: 'channel' });
    getIntegration.mockResolvedValue({
      _id: 'integration',
      kind: 'facebook-messenger',
      channelId: 'channel',
    });
    jest
      .mocked(visibleChannelsFilter)
      .mockResolvedValue({ _id: { $in: ['channel'] } });
    jest.mocked(handleFacebookReaction).mockResolvedValue({
      status: 'success',
      data: {
        _id: 'message',
        conversationId: 'provider-conversation',
        reactions: [],
      },
    });
  });

  it('uses the acting user and publishes to the inbox conversation', async () => {
    await expect(reactToConversationMessage(args, context)).resolves.toBe(true);
    expect(checkPermission).toHaveBeenCalledWith('conversationMessageAdd');
    expect(exists).toHaveBeenCalledWith({
      $and: [{ _id: 'channel' }, { _id: { $in: ['channel'] } }],
    });
    expect(handleFacebookReaction).toHaveBeenCalledWith(context.models, {
      ...args,
      integrationId: 'integration',
      userId: 'agent',
      remove: false,
    });
    expect(graphqlPubsub.publish).toHaveBeenCalledWith(
      'conversationMessageInserted:conversation',
      {
        conversationMessageInserted: {
          _id: 'message',
          conversationId: 'conversation',
          reactions: [],
        },
      },
    );
  });

  it('removes a reaction without requiring an emoji', async () => {
    await reactToConversationMessage(
      { ...args, reaction: null, remove: true },
      context,
    );
    expect(handleFacebookReaction).toHaveBeenCalledWith(
      context.models,
      expect.objectContaining({ remove: true, reaction: '' }),
    );
  });

  it('rejects missing reaction input before sending to Facebook', async () => {
    await expect(
      reactToConversationMessage({ ...args, reaction: '' }, context),
    ).rejects.toThrow('A reaction is required');
    expect(handleFacebookReaction).not.toHaveBeenCalled();
  });

  it('refuses inaccessible channels', async () => {
    exists.mockResolvedValue(null);
    await expect(reactToConversationMessage(args, context)).rejects.toThrow(
      'access',
    );
    expect(handleFacebookReaction).not.toHaveBeenCalled();
  });

  it('refuses callers without send permission', async () => {
    checkPermission.mockRejectedValueOnce(new Error('Permission denied'));
    await expect(reactToConversationMessage(args, context)).rejects.toThrow(
      'Permission denied',
    );
    expect(handleFacebookReaction).not.toHaveBeenCalled();
  });

  it('propagates provider failures without publishing success', async () => {
    jest
      .mocked(handleFacebookReaction)
      .mockRejectedValueOnce(new Error('Facebook unavailable'));
    await expect(reactToConversationMessage(args, context)).rejects.toThrow(
      'Facebook unavailable',
    );
    expect(graphqlPubsub.publish).not.toHaveBeenCalled();
  });
});

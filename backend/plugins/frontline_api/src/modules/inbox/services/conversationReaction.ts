import { visibleChannelsFilter } from '@/channel/utils';
import { handleFacebookReaction } from '@/integrations/facebook/handleFacebookMessage';
import { publishFacebookMessage } from '@/integrations/facebook/services/messageEvents';
import { handleInstagramReaction } from '@/integrations/instagram/handleInstagramMessage';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';

export interface IConversationReaction {
  conversationId: string;
  messageId: string;
  reaction?: string | null;
  remove?: boolean | null;
}

export const reactToConversationMessage = async (
  { conversationId, messageId, reaction, remove }: IConversationReaction,
  context: IContext,
): Promise<boolean> => {
  const { models, user, checkPermission } = context;
  if (!user?._id) throw new Error('Authentication required');
  await checkPermission('conversationMessageAdd');
  if (!conversationId.trim() || !messageId.trim()) {
    throw new Error('Conversation and message IDs are required');
  }
  if (!remove && !reaction?.trim()) {
    throw new Error('A reaction is required');
  }

  const conversation = await models.Conversations.getConversation(
    conversationId,
  );
  const integration = await models.Integrations.getIntegration({
    _id: conversation.integrationId,
  });
  const channelId = integration.channelId;
  const visibleChannels = await visibleChannelsFilter(context);
  if (
    !channelId ||
    !(await models.Channels.exists({
      $and: [{ _id: channelId }, visibleChannels],
    }))
  ) {
    throw new Error('You do not have access to this conversation');
  }
  if (!['facebook-messenger', 'instagram-messenger'].includes(integration.kind)) {
    throw new Error('Reactions are not supported for this integration');
  }

  const react = integration.kind === 'instagram-messenger'
    ? handleInstagramReaction
    : handleFacebookReaction;
  const result = await react(models, {
    integrationId: integration._id,
    conversationId,
    messageId,
    reaction: reaction || '',
    remove: Boolean(remove),
    userId: user._id,
  });

  if (integration.kind === 'instagram-messenger') {
    await graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
      conversationMessageInserted: { ...result.data, conversationId },
    });
  } else {
    await publishFacebookMessage(conversationId, result.data);
  }
  return true;
};

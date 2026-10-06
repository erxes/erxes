import { visibleChannelsFilter } from '@/channel/utils';
import { handleFacebookReaction } from '@/integrations/facebook/handleFacebookMessage';
import { publishFacebookMessage } from '@/integrations/facebook/services/messageEvents';
import { handleInstagramReaction } from '@/integrations/instagram/handleInstagramMessage';
import { publishInstagramMessage } from '@/integrations/instagram/services/messageEvents';
import { handleDiscordReaction } from '@/integrations/discord/services/messages/actions';
import { publishDiscordMessage } from '@/integrations/discord/services/messages/events';
import type { IContext } from '~/connectionResolvers';

export interface IConversationReaction {
  conversationId: string;
  messageId: string;
  reaction?: string | null;
  remove?: boolean | null;
}

const REACTION_HANDLERS = {
  'discord-messenger': {
    react: handleDiscordReaction,
    publish: publishDiscordMessage,
  },
  'facebook-messenger': {
    react: handleFacebookReaction,
    publish: publishFacebookMessage,
  },
  'instagram-messenger': {
    react: handleInstagramReaction,
    publish: publishInstagramMessage,
  },
} as const;

const getReactionHandler = (kind: string) =>
  Object.prototype.hasOwnProperty.call(REACTION_HANDLERS, kind)
    ? REACTION_HANDLERS[kind as keyof typeof REACTION_HANDLERS]
    : undefined;

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

  const conversation =
    await models.Conversations.getConversation(conversationId);
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
  const handler = getReactionHandler(integration.kind);
  if (!handler) {
    throw new Error('Reactions are not supported for this integration');
  }

  const result = await handler.react(models, {
    integrationId: integration._id,
    conversationId,
    messageId,
    reaction: reaction || '',
    remove: Boolean(remove),
    userId: user._id,
  });

  await handler.publish(conversationId, result.data, context.subdomain);
  return true;
};

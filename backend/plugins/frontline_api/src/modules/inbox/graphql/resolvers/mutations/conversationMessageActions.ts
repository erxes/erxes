import type { IMessage } from '@/inbox/@types/conversationMessages';
import { authorizeConversationAccess } from '@/inbox/utils/conversationAccess';
import {
  reactToConversationMessage,
  type IConversationReaction,
} from '@/inbox/services/conversationReaction';
import type { IContext } from '~/connectionResolvers';
import { dispatchConversationToService } from '@/inbox/graphql/resolvers/mutations/conversationAutomation';

export const conversationMessageActionMutations = {
  async conversationMessagePin(
    _root: unknown,
    {
      conversationId,
      messageId,
      remove,
    }: {
      conversationId: string;
      messageId: string;
      remove?: boolean;
    },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');
    await authorizeConversationAccess(models, user, conversationId);
    const conversation =
      await models.Conversations.getConversation(conversationId);
    const integration = await models.Integrations.getIntegration({
      _id: conversation.integrationId,
    });
    if (integration.kind !== 'discord-messenger') {
      throw new Error('Pinning messages is not supported by this channel');
    }
    const response = await dispatchConversationToService(subdomain, 'discord', {
      action: 'pin-messenger',
      type: 'discord',
      payload: JSON.stringify({
        integrationId: integration._id,
        conversationId,
        messageId,
        remove,
      }),
      integrationId: integration._id,
    });
    if (response?.status === 'error') {
      throw new Error(response.errorMessage || 'Failed to update message pin');
    }
    return response?.data || { status: 'success' };
  },
  async conversationMessageReact(
    _root: unknown,
    args: IConversationReaction,
    context: IContext,
  ): Promise<boolean> {
    return reactToConversationMessage(args, context);
  },
  async conversationAgentTyping(
    _root,
    {
      conversationId,
      typing = true,
    }: { conversationId: string; typing?: boolean },
    { models, subdomain }: IContext,
  ) {
    try {
      const conversation =
        await models.Conversations.getConversation(conversationId);
      if (!conversation?.integrationId) {
        return false;
      }

      const integration = await models.Integrations.getIntegration({
        _id: conversation.integrationId,
      });
      if (!integration?.kind) {
        return false;
      }

      const serviceName = integration.kind.split('-')[0];

      await dispatchConversationToService(subdomain, serviceName, {
        action: 'typing',
        type: serviceName,
        payload: JSON.stringify({
          integrationId: integration._id,
          conversationId: conversation._id,
          typing,
        }),
        integrationId: integration._id,
      });

      return true;
    } catch {
      return false;
    }
  },
  async conversationMessageEdit(
    _root,
    { _id, ...fields }: IMessage & { _id: string },
    { user, models }: IContext,
  ) {
    const message = await models.ConversationMessages.getMessage(_id);
    if (message.internal && user._id === message.userId) {
      return await models.ConversationMessages.updateMessage(_id, fields);
    }
    throw new Error(
      `You cannot edit this message. Only the author of an internal message can edit it.`,
    );
  },
};

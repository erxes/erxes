import type { IConversationMessageAdd } from '@/inbox/@types/conversationMessages';
import { resolveForwardedSnapshotForMessage } from '@/inbox/forwardedMessage';
import { createNotifications } from '~/utils/notifications';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import {
  dispatchConversationToService,
  markAutomatedReplyHumanActive,
  publishUnreadCountsSafely,
} from '@/inbox/graphql/resolvers/mutations/conversationAutomation';
import {
  publishMessage,
  sendNotifications,
} from '@/inbox/graphql/resolvers/mutations/conversationNotifications';
import { storeDispatchedMessage } from '@/inbox/services/storeDispatchedMessage';
import { conversationMessageActionMutations } from '@/inbox/graphql/resolvers/mutations/conversationMessageActions';

export const conversationMessageMutations = {
  ...conversationMessageActionMutations,

  async conversationMessageAdd(
    _root,
    doc: IConversationMessageAdd,
    { user, models, subdomain }: IContext,
  ) {
    try {
      const conversation = await models.Conversations.getConversation(
        doc.conversationId,
      );
      const integration = await models.Integrations.getIntegration({
        _id: conversation.integrationId,
      });

      const { _id: integrationId } = integration;
      const { _id: conversationId } = conversation;
      const {
        content = '',
        internal,
        attachments = [],
        extraInfo,
        poll,
        replyToMessageId,
      } = doc;
      const { _id: userId } = user;
      const forwardedSnapshot =
        !internal && integration.kind === 'discord-messenger'
          ? await resolveForwardedSnapshotForMessage(models, user, extraInfo)
          : undefined;

      await sendNotifications(subdomain, {
        user,
        conversations: [conversation],
        type: 'conversationAddMessage',
        mobile: true,
        messageContent: content,
      });

      const { kind } = integration;

      const customer = conversation.customerId
        ? await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'findOne',
            input: { _id: conversation.customerId },
            defaultValue: null,
          })
        : null;

      if (!customer) {
        throw new Error('Customer not found for the conversation');
      }

      const email = customer.primaryEmail;

      if (!internal && kind === 'lead' && email) {
        await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'mutation',
          module: 'core',
          action: 'sendEmail',
          input: {
            toEmails: [email],
            title: 'Reply',
            template: { data: content },
          },
        });
      }

      if (doc.mentionedUserIds && doc.mentionedUserIds.length > 0) {
        const userIds = doc.mentionedUserIds.filter((id) => id !== userId);

        await createNotifications({
          contentType: 'inbox',
          contentTypeId: doc.conversationId,
          fromUserId: userId,
          subdomain,
          notificationType: 'internalNote',
          userIds,
          action: 'created',
        });
      }

      if (internal) {
        const message = await models.ConversationMessages.addMessage(
          doc,
          userId,
        );
        await publishUnreadCountsSafely({
          conversationId,
          integrationId,
          userIds: doc.mentionedUserIds?.filter((id) => id !== userId) || [],
          models,
          subdomain,
        });
        const dbMessage = await models.ConversationMessages.getMessage(
          message._id,
        );

        publishMessage(models, dbMessage);

        return dbMessage;
      }

      const serviceName = integration.kind.split('-')[0];
      const actionType = kind?.split('-')[1] || 'unknown';

      const response = await dispatchConversationToService(
        subdomain,
        serviceName,
        {
          action: `reply-${actionType}`,
          type: serviceName,
          payload: JSON.stringify({
            integrationId,
            conversationId,
            content,
            internal,
            attachments,
            extraInfo,
            poll,
            replyToMessageId,
            userId,
          }),
          integrationId,
        },
      );

      if (response?.status === 'error') {
        throw new Error(
          response.errorMessage || 'Failed to send message to external service',
        );
      }

      if (response?.data?.data) {
        return storeDispatchedMessage({
          data: response.data.data,
          doc,
          kind,
          conversation,
          integrationId,
          userId,
          models,
          subdomain,
          forwardedSnapshot,
        });
      }

      const message = await models.ConversationMessages.addMessage(doc, userId);
      await publishUnreadCountsSafely({
        conversationId,
        integrationId,
        userIds: doc.mentionedUserIds?.filter((id) => id !== userId) || [],
        models,
        subdomain,
      });
      const dbMessage = await models.ConversationMessages.getMessage(
        message._id,
      );

      await markAutomatedReplyHumanActive({
        models,
        conversation,
        userId,
      });

      publishMessage(models, dbMessage, conversation.customerId);

      return dbMessage;
    } catch (err) {
      throw new Error(`Failed to add message to conversation: ${err.message}`);
    }
  },
};

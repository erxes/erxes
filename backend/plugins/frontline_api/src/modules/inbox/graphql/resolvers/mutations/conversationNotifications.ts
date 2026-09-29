import { IConversationDocument } from '@/inbox/@types/conversations';
import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import * as _ from 'underscore';
import strip from 'strip';
import { IModels } from '~/connectionResolvers';
import { debugError } from '~/modules/inbox/utils';

export const conversationNotifReceivers = (
  conversation: IConversationDocument,
  currentUserId: string,
  exclude = true,
): string[] => {
  let userIds: string[] = [];
  if (conversation.assignedUserId) {
    userIds.push(conversation.assignedUserId);
  }
  if (Array.isArray(conversation.participatedUserIds)) {
    userIds = _.union(userIds, conversation.participatedUserIds);
  }
  if (
    exclude &&
    currentUserId &&
    conversation.assignedUserId !== currentUserId
  ) {
    userIds = _.without(userIds, currentUserId);
  }
  return userIds;
};
export const publishConversationsChanged = async (
  _subdomain: string,
  _ids: string[],
  type: string,
): Promise<string[]> => {
  for (const _id of _ids) {
    await graphqlPubsub.publish(`conversationChanged:${_id}`, {
      conversationChanged: { conversationId: _id, type },
    });
  }

  return _ids;
};

export const publishMessage = async (
  models: IModels,
  message: IMessageDocument,
  customerId?: string,
) => {
  await graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    { conversationMessageInserted: JSON.parse(JSON.stringify(message)) },
  );
  if (customerId) {
    const unreadCount =
      await models.ConversationMessages.widgetsGetUnreadMessagesCount(
        message.conversationId,
      );

    await graphqlPubsub.publish(
      `conversationAdminMessageInserted:${customerId}`,
      {
        conversationAdminMessageInserted: {
          customerId,
          unreadCount,
        },
      },
    );
  }
};

const sendClientPortalMobileNotification = async (
  subdomain: string,
  conversation: IConversationDocument,
  content: string,
) => {
  if (!conversation.customerId) return;

  try {
    const cpUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input: { erxesCustomerId: conversation.customerId },
      defaultValue: null,
    });

    if (!cpUser?._id || !cpUser.clientPortalId) return;

    const clientPortal = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'clientPortals',
      action: 'get',
      input: { _id: cpUser.clientPortalId },
      defaultValue: null,
    });

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'cpNotifications',
      action: 'create',
      input: {
        cpUserIds: [cpUser._id],
        clientPortalId: cpUser.clientPortalId,
        eventType: 'conversationMessage',
        data: {
          title: clientPortal?.name || 'New chat message',
          message: strip(content) || 'You have a new message',
          type: 'info',
          contentType: 'conversation',
          contentTypeId: conversation._id,
          priority: 'high',
          action: 'openConversation',
          kind: 'user',
          metadata: {
            conversationId: conversation._id,
            id: conversation._id,
            type: 'messenger',
          },
        },
      },
    });
  } catch (e) {
    debugError(
      `Failed to send client portal mobile notification: ${e.message}`,
    );
  }
};

const sendAgentMobileNotification = async (
  subdomain: string,
  conversation: IConversationDocument,
  userId: string,
  title: string,
  content: string,
) => {
  const data: Record<string, string> = {
    type: 'messenger',
    id: String(conversation._id),
    conversationId: String(conversation._id),
    notificationType: 'chat_message',
  };

  if (conversation.integrationId) {
    data.integrationId = String(conversation.integrationId);
  }

  if (conversation.customerId) {
    data.customerId = String(conversation.customerId);
  }

  try {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'core',
      action: 'sendMobileNotification',
      input: {
        title,
        body: strip(content),
        receivers: conversationNotifReceivers(conversation, userId, false),
        customerId: conversation.customerId,
        conversationId: conversation._id,
        data,
      },
    });
  } catch (e) {
    debugError(`Failed to send mobile notification: ${e.message}`);
  }
};

export const sendNotifications = async (
  subdomain: string,
  {
    user,
    conversations,
    type,
    mobile,
    messageContent,
  }: {
    user: IUserDocument;
    conversations: IConversationDocument[];
    type: string;
    mobile?: boolean;
    messageContent?: string;
  },
) => {
  for (const conversation of conversations) {
    if (!conversation?._id) {
      throw new Error('Error: Conversation or Conversation ID is undefined');
    }

    if (!user?._id) {
      throw new Error('Error: User or User ID is undefined');
    }

    const doc = {
      createdUser: user,
      link: `/inbox/index?_id=${conversation._id}`,
      title: 'Conversation updated',
      content: messageContent || conversation.content || 'Conversation updated',
      notifType: type,
      receivers: conversationNotifReceivers(conversation, user._id),
      action: 'updated conversation',
      contentType: 'conversation',
      contentTypeId: conversation._id,
    };
    switch (type) {
      case 'conversationAddMessage':
        doc.action = `sent you a message`;
        doc.receivers = conversationNotifReceivers(conversation, user._id);
        break;
      case 'conversationAssigneeChange':
        doc.action = 'has assigned you to conversation ';
        break;
      case 'unassign':
        doc.notifType = 'conversationAssigneeChange';
        doc.action = 'has removed you from conversation';
        break;
      case 'conversationStateChange':
        doc.action = `changed conversation status to ${(
          conversation.status || ''
        ).toUpperCase()}`;
        break;
      default:
        break;
    }

    if (mobile) {
      await sendClientPortalMobileNotification(
        subdomain,
        conversation,
        doc.content,
      );
      await sendAgentMobileNotification(
        subdomain,
        conversation,
        user._id,
        doc.title,
        doc.content,
      );
    }
  }
};

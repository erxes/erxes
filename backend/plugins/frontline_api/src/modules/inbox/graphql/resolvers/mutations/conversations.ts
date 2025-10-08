import * as _ from 'underscore';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IConversationDocument } from '~/modules/inbox/@types/conversations';
import QueryBuilder, { IListArgs } from '~/conversationQueryBuilder';
import { CONVERSATION_STATUSES } from '~/modules/inbox/db/definitions/constants';
import { generateModels, IContext, IModels } from '~/connectionResolvers';
import { IConversationMessageAdd } from '~/modules/inbox/@types/conversationMessages';
import { AUTO_BOT_MESSAGES } from '~/modules/inbox/db/definitions/constants';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { handleFacebookIntegration } from '@/integrations/facebook/messageBroker';
import { graphqlPubsub } from 'erxes-api-shared/utils';

interface DispatchConversationData {
  action: string;
  type: string;
  payload: string;
  integrationId: string;
}

/**
 * conversation notrification receiver ids
 */
export const dispatchConversationToService = async (
  subdomain: string,
  serviceName: string,
  data: DispatchConversationData,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await handleFacebookIntegration({ subdomain, data });

      case 'instagram':
        // TODO: Implement Instagram logic
        break;

      case 'calls':
        break;

      case 'mobinetSms':
        // TODO: Implement Mobinet SMS logic
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message was not sent. Error: ${e.message}. Go to integrations list and fix it.`,
    );
  }
};

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
/**
 * Using this subscription to track conversation detail's assignee, tag, status
 * changes
 */
export const publishConversationsChanged = async (
  subdomain: string,
  _ids: string[],
  type: string,
): Promise<string[]> => {
  const models = await generateModels(subdomain);

  for (const _id of _ids) {
    await graphqlPubsub.publish(`conversationChanged:${_id}`, {
      conversationChanged: { conversationId: _id, type },
    });

    await models.Conversations.findOne({ _id });
  }

  return _ids;
};

/**
 * Publish admin's message
 */
export const publishMessage = async (
  models: IModels,
  message: any,
  customerId?: string,
) => {
  await graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    {
      conversationMessageInserted: message,
    },
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

export const sendNotifications = async ({
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
}) => {
  for (const conversation of conversations) {
    if (!conversation || !conversation._id) {
      throw new Error('Error: Conversation or Conversation ID is undefined');
    }

    if (!user || !user._id) {
      throw new Error('Error: User or User ID is undefined');
    }

    const doc = {
      createdUser: user,
      link: `/inbox/index?_id=${conversation._id}`,
      title: 'Conversation updated',
      content: messageContent
        ? messageContent
        : conversation.content || 'Conversation updated',
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
  }
};

const getConversationById = async (models: IModels, selector) => {
  const oldConversations = await models.Conversations.find(selector).lean();
  const oldConversationById = {};
  for (const conversation of oldConversations) {
    oldConversationById[conversation._id] = conversation;
  }
  return { oldConversationById, oldConversations };
};

export const conversationMutations = {
  /**
   * Create new message in conversation
   */
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
      const { content = '', internal, attachments = [], extraInfo } = doc;
      const { _id: userId } = user;

      await sendNotifications({
        user,
        conversations: [conversation],
        type: 'conversationAddMessage',
        mobile: true,
        messageContent: content,
      });

      const { kind } = integration;
      const customer = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: { query: { _id: conversation.customerId } },
      });

      if (!customer) {
        throw new Error('Customer not found for the conversation');
      }

      const email = customer.primaryEmail;

      // Send auto-reply email for lead forms
      if (!internal && kind === 'lead' && email) {
        await sendTRPCMessage({
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
            userId,
          }),
          integrationId,
        },
      );

      // Case: external service handled it, do not save locally
      if (response?.data?.data) {
        const { conversationId, content } = response.data.data;

        if (conversationId && content) {
          await models.Conversations.updateConversation(conversationId, {
            content: content || '',
            updatedAt: new Date(),
          });
        }

        const message = await models.ConversationMessages.addMessage(
          doc,
          userId,
        );
        const dbMessage = await models.ConversationMessages.getMessage(
          message._id,
        );

        publishMessage(models, dbMessage, conversation.customerId);
        return dbMessage;
      }

      //  Fallback: always save message locally if not already handled
      const message = await models.ConversationMessages.addMessage(doc, userId);
      const dbMessage = await models.ConversationMessages.getMessage(
        message._id,
      );

      if (internal) {
        // Internal message: only publish to admins
        publishMessage(models, dbMessage);
      } else {
        // Normal message: publish to both admin and client
        publishMessage(models, dbMessage, conversation.customerId);
      }

      return dbMessage;
    } catch (err) {
      console.error('conversationMessageAdd error:', err);
      throw new Error(`Failed to add message to conversation: ${err.message}`);
    }
  },

  async conversationMessageEdit(
    _root,
    { _id, ...fields }: any,
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

  /**
   * Assign employee to conversation
   */
  async conversationsAssign(
    _root,
    {
      conversationIds,
      assignedUserId,
    }: { conversationIds: string[]; assignedUserId: string },
    { user, models, subdomain }: IContext,
  ) {
    const conversations: IConversationDocument[] =
      await models.Conversations.assignUserConversation(
        conversationIds,
        assignedUserId,
      );

    // notify graphl subscription
    publishConversationsChanged(subdomain, conversationIds, 'assigneeChanged');

    await sendNotifications({
      user,
      conversations,
      type: 'conversationAssigneeChange',
    });

    return conversations;
  },

  /**
   * Unassign employee from conversation
   */
  async conversationsUnassign(
    _root,
    { _ids }: { _ids: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const { oldConversations } = await getConversationById(models, {
      _id: { $in: _ids },
    });
    const updatedConversations =
      await models.Conversations.unassignUserConversation(_ids);

    await sendNotifications({
      user,
      conversations: oldConversations,
      type: 'unassign',
    });

    // notify graphl subscription
    publishConversationsChanged(subdomain, _ids, 'assigneeChanged');

    return updatedConversations;
  },

  /**
   * Change conversation status
   */
  async conversationsChangeStatus(
    _root,
    { _ids, status }: { _ids: string[]; status: string },
    { user, models, subdomain }: IContext,
  ) {
    await models.Conversations.changeStatusConversation(
      _ids,
      status,
      'OQgac3z4G3I2LW9QPpAtL',
    );

    // notify graphl subscription
    publishConversationsChanged(subdomain, _ids, status);

    const updatedConversations = await models.Conversations.find({
      _id: { $in: _ids },
    });

    await sendNotifications({
      user,
      conversations: updatedConversations,
      type: 'conversationStateChange',
    });

    return updatedConversations;
  },

  /**
   * Resolve all conversations
   */
  async conversationResolveAll(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext,
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, { _id: user._id });

    await qb.buildAllQueries();
    const query = qb.mainQuery();

    const param = {
      status: CONVERSATION_STATUSES.CLOSED,
      closedUserId: user._id,
      closedAt: new Date(),
    };

    const updated = await models.Conversations.resolveAllConversation(
      query,
      param,
    );

    return updated.nModified || 0;
  },

  /**
   * Conversation mark as read
   */
  async conversationMarkAsRead(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    return await models.Conversations.markAsReadConversation(_id, user._id);
  },

  async changeConversationOperator(
    _root,
    { _id, operatorStatus }: { _id: string; operatorStatus: string },
    { models }: IContext,
  ) {
    const message = await models.ConversationMessages.createMessage({
      conversationId: _id,
      botData: [
        {
          type: 'text',
          text: AUTO_BOT_MESSAGES.CHANGE_OPERATOR,
        },
      ],
    });
    await graphqlPubsub.publish(
      `conversationMessageInserted:${message.conversationId}`,
      {
        conversationMessageInserted: message,
      },
    );

    return models.Conversations.updateOne(
      { _id },
      { $set: { operatorStatus } },
    );
  },

  async conversationConvertToCard(
    _root,
    params: any,
    { user, models }: IContext,
  ) {
    const { _id } = params;

    const conversation = await models.Conversations.getConversation(_id);

    const args = {
      ...params,
      conversation,
      user,
    };
    return args;
  },

  async conversationEditCustomFields(
    _root,
    { _id, customFieldsData }: { _id: string; customFieldsData: any },
    { models }: IContext,
  ) {
    await models.Conversations.updateConversation(_id, { customFieldsData });
    return models.Conversations.getConversation(_id);
  },
};

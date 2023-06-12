import * as strip from 'strip';
import * as _ from 'underscore';

import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IUserDocument } from '@erxes/api-utils/src/types';

import { MESSAGE_TYPES } from '../../models/definitions/constants';
import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { IConversationDocument } from '../../models/definitions/conversations';
import { AUTO_BOT_MESSAGES } from '../../models/definitions/constants';
import { debug, graphqlPubsub } from '../../configs';
import {
  sendContactsMessage,
  sendCardsMessage,
  sendCoreMessage,
  sendIntegrationsMessage,
  sendNotificationsMessage,
  sendToWebhook,
  sendCommonMessage,
  sendAutomationsMessage
} from '../../messageBroker';
import { putUpdateLog } from '../../logUtils';
import QueryBuilder, { IListArgs } from '../../conversationQueryBuilder';
import { CONVERSATION_STATUSES } from '../../models/definitions/constants';
import { generateModels, IContext, IModels } from '../../connectionResolver';
import { isServiceRunning } from '../../utils';
import { IIntegrationDocument } from '../../models/definitions/integrations';

export interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  userId?: string;
  extraInfo?: any;
}

interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
  duration?: number;
}

interface IConversationConvert {
  _id: string;
  type: string;
  itemId: string;
  stageId: string;
  itemName: string;
  bookingProductId?: string;
  customFieldsData?: { [key: string]: any };
  priority?: string;
  assignedUserIds?: string[];
  labelIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  attachments?: IAttachment[];
  description?: string;
}

/**
 *  Send conversation to integrations
 */
const sendConversationToServices = async (
  subdomain: string,
  integration: IIntegrationDocument,
  serviceName: string,
  payload: object
) => {
  try {
    return sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName,
      action: 'api_to_integrations',
      data: {
        action: `reply-${integration.kind.split('-')[1]}`,
        type: serviceName,
        payload: JSON.stringify(payload)
      }
    });
  } catch (e) {
    throw new Error(
      `Your message not sent Error: ${e.message}. Go to integrations list and fix it`
    );
  }
};

/**
 * conversation notrification receiver ids
 */
export const conversationNotifReceivers = (
  conversation: IConversationDocument,
  currentUserId: string,
  exclude: boolean = true
): string[] => {
  let userIds: string[] = [];

  // assigned user can get notifications
  if (conversation.assignedUserId) {
    userIds.push(conversation.assignedUserId);
  }

  // participated users can get notifications
  if (
    conversation.participatedUserIds &&
    conversation.participatedUserIds.length > 0
  ) {
    userIds = _.union(userIds, conversation.participatedUserIds);
  }

  // exclude current user
  if (exclude) {
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
  type: string
): Promise<string[]> => {
  const models = await generateModels(subdomain);

  for (const _id of _ids) {
    graphqlPubsub.publish('conversationChanged', {
      conversationChanged: { conversationId: _id, type }
    });

    const conversation = await models.Conversations.findOne({ _id });

    sendAutomationsMessage({
      subdomain,
      action: 'trigger',
      data: {
        type: `inbox:conversation`,
        targets: [conversation]
      }
    });
  }

  return _ids;
};

/**
 * Publish admin's message
 */
export const publishMessage = async (
  models: IModels,
  message: IMessageDocument,
  customerId?: string
) => {
  graphqlPubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message
  });

  // widget is listening for this subscription to show notification
  // customerId available means trying to notify to client
  if (customerId) {
    const unreadCount = await models.ConversationMessages.widgetsGetUnreadMessagesCount(
      message.conversationId
    );

    graphqlPubsub.publish('conversationAdminMessageInserted', {
      conversationAdminMessageInserted: {
        customerId,
        unreadCount
      }
    });
  }
};

export const sendNotifications = async (
  subdomain: string,
  {
    user,
    conversations,
    type,
    mobile,
    messageContent
  }: {
    user: IUserDocument;
    conversations: IConversationDocument[];
    type: string;
    mobile?: boolean;
    messageContent?: string;
  }
) => {
  for (const conversation of conversations) {
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
      contentTypeId: conversation._id
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

    await sendNotificationsMessage({
      subdomain,
      action: 'send',
      data: doc
    });

    if (mobile) {
      // send mobile notification ======
      try {
        await sendCoreMessage({
          subdomain,
          action: 'sendMobileNotification',
          data: {
            title: doc.title,
            body: strip(doc.content),
            receivers: conversationNotifReceivers(
              conversation,
              user._id,
              false
            ),
            customerId: conversation.customerId,
            conversationId: conversation._id,
            data: {
              type: 'messenger',
              id: conversation._id
            }
          }
        });
      } catch (e) {
        debug.error(`Failed to send mobile notification: ${e.message}`);
      }
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

const conversationMutations = {
  /**
   * Create new message in conversation
   */
  async conversationMessageAdd(
    _root,
    doc: IConversationMessageAdd,
    { user, models, subdomain }: IContext
  ) {
    const conversation = await models.Conversations.getConversation(
      doc.conversationId
    );
    const integration = await models.Integrations.getIntegration({
      _id: conversation.integrationId
    });

    await sendNotifications(subdomain, {
      user,
      conversations: [conversation],
      type: 'conversationAddMessage',
      mobile: true,
      messageContent: doc.content
    });

    const kind = integration.kind;

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: conversation.customerId
      },
      isRPC: true
    });

    // if conversation's integration kind is form then send reply to
    // customer's email
    const email = customer ? customer.primaryEmail : '';

    if (!doc.internal && kind === 'lead' && email) {
      await sendCoreMessage({
        subdomain,
        action: 'sendEmail',
        data: {
          toEmails: [email],
          title: 'Reply',
          template: {
            data: doc.content
          }
        }
      });
    }

    const serviceName = integration.kind.split('-')[0];
    const serviceRunning = await isServiceRunning(serviceName);

    if (serviceRunning && !doc.internal) {
      const payload = {
        integrationId: integration._id,
        conversationId: conversation._id,
        content: doc.content || '',
        internal: doc.internal,
        attachments: doc.attachments || [],
        extraInfo: doc.extraInfo,
        userId: user._id
      };

      const response = await sendConversationToServices(
        subdomain,
        integration,
        serviceName,
        payload
      );

      // if the service runs separately & returns data, then don't save message inside inbox
      if (response && response.data) {
        const { conversationId, content } = response.data;

        if (!!conversationId && !!content) {
          await models.Conversations.updateConversation(conversationId, {
            content: content || '',
            updatedAt: new Date()
          });
        }
        return { ...response.data };
      }
    }

    // do not send internal message to third service integrations
    if (doc.internal) {
      const messageObj = await models.ConversationMessages.addMessage(
        doc,
        user._id
      );

      // publish new message to conversation detail
      publishMessage(models, messageObj);

      return messageObj;
    }

    const message = await models.ConversationMessages.addMessage(doc, user._id);

    const dbMessage = await models.ConversationMessages.getMessage(message._id);

    await sendToWebhook({
      subdomain,
      data: {
        action: 'create',
        type: 'inbox:userMessages',
        params: dbMessage
      }
    });

    // Publishing both admin & client
    publishMessage(models, dbMessage, conversation.customerId);

    return dbMessage;
  },

  /**
   * Assign employee to conversation
   */
  async conversationsAssign(
    _root,
    {
      conversationIds,
      assignedUserId
    }: { conversationIds: string[]; assignedUserId: string },
    { user, models, subdomain }: IContext
  ) {
    const { oldConversationById } = await getConversationById(models, {
      _id: { $in: conversationIds }
    });

    const conversations: IConversationDocument[] = await models.Conversations.assignUserConversation(
      conversationIds,
      assignedUserId
    );

    // notify graphl subscription
    publishConversationsChanged(subdomain, conversationIds, 'assigneeChanged');

    await sendNotifications(subdomain, {
      user,
      conversations,
      type: 'conversationAssigneeChange'
    });

    for (const conversation of conversations) {
      await putUpdateLog(
        models,
        subdomain,
        {
          type: 'conversation',
          description: 'assignee Changed',
          object: oldConversationById[conversation._id],
          newData: { assignedUserId },
          updatedDocument: conversation
        },
        user
      );
    }

    return conversations;
  },

  /**
   * Unassign employee from conversation
   */
  async conversationsUnassign(
    _root,
    { _ids }: { _ids: string[] },
    { user, models, subdomain }: IContext
  ) {
    const {
      oldConversations,
      oldConversationById
    } = await getConversationById(models, { _id: { $in: _ids } });
    const updatedConversations = await models.Conversations.unassignUserConversation(
      _ids
    );

    await sendNotifications(subdomain, {
      user,
      conversations: oldConversations,
      type: 'unassign'
    });

    // notify graphl subscription
    publishConversationsChanged(subdomain, _ids, 'assigneeChanged');

    for (const conversation of updatedConversations) {
      await putUpdateLog(
        models,
        subdomain,
        {
          type: 'conversation',
          description: 'unassignee',
          object: oldConversationById[conversation._id],
          newData: { assignedUserId: '' },
          updatedDocument: conversation
        },
        user
      );
    }

    return updatedConversations;
  },

  /**
   * Change conversation status
   */
  async conversationsChangeStatus(
    _root,
    { _ids, status }: { _ids: string[]; status: string },
    { user, models, subdomain, serverTiming }: IContext
  ) {
    serverTiming.startTime('changeStatus');

    const { oldConversationById } = await getConversationById(models, {
      _id: { $in: _ids }
    });

    await models.Conversations.changeStatusConversation(_ids, status, user._id);

    serverTiming.endTime('changeStatus');

    serverTiming.startTime('sendNotifications');

    // notify graphl subscription
    publishConversationsChanged(subdomain, _ids, status);

    const updatedConversations = await models.Conversations.find({
      _id: { $in: _ids }
    });

    await sendNotifications(subdomain, {
      user,
      conversations: updatedConversations,
      type: 'conversationStateChange'
    });

    serverTiming.endTime('sendNotifications');

    serverTiming.startTime('putLog');

    for (const conversation of updatedConversations) {
      await putUpdateLog(
        models,
        subdomain,
        {
          type: 'conversation',
          description: 'change status',
          object: oldConversationById[conversation._id],
          newData: { status },
          updatedDocument: conversation
        },
        user
      );
    }

    serverTiming.endTime('putLog');

    return updatedConversations;
  },

  /**
   * Resolve all conversations
   */
  async conversationResolveAll(
    _root,
    params: IListArgs,
    { user, models, subdomain }: IContext
  ) {
    // initiate query builder
    const qb = new QueryBuilder(models, subdomain, params, { _id: user._id });

    await qb.buildAllQueries();
    const query = qb.mainQuery();

    const { oldConversationById } = await getConversationById(models, query);
    const param = {
      status: CONVERSATION_STATUSES.CLOSED,
      closedUserId: user._id,
      closedAt: new Date()
    };

    const updated = await models.Conversations.resolveAllConversation(
      query,
      param
    );

    const updatedConversations = await models.Conversations.find({
      _id: { $in: Object.keys(oldConversationById) }
    }).lean();

    for (const conversation of updatedConversations) {
      await putUpdateLog(
        models,
        subdomain,
        {
          type: 'conversation',
          description: 'resolve all',
          object: oldConversationById[conversation._id],
          newData: param,
          updatedDocument: conversation
        },
        user
      );
    }

    return updated.nModified || 0;
  },

  /**
   * Conversation mark as read
   */
  async conversationMarkAsRead(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    return models.Conversations.markAsReadConversation(_id, user._id);
  },

  async conversationCreateVideoChatRoom(
    _root,
    { _id },
    { user, models, subdomain }: IContext
  ) {
    let message;

    try {
      const doc = {
        conversationId: _id,
        internal: false,
        contentType: MESSAGE_TYPES.VIDEO_CALL
      };

      message = await models.ConversationMessages.addMessage(doc, user._id);

      const videoCallData = await sendIntegrationsMessage({
        subdomain,
        action: 'createDailyRoom',
        data: {
          erxesApiConversationId: _id,
          erxesApiMessageId: message._id
        },
        isRPC: true
      });

      const updatedMessage = { ...message._doc, videoCallData };

      // publish new message to conversation detail
      publishMessage(models, updatedMessage);

      return videoCallData;
    } catch (e) {
      debug.error(e.message);

      await models.ConversationMessages.deleteOne({ _id: message._id });

      throw new Error(e.message);
    }
  },

  async changeConversationOperator(
    _root,
    { _id, operatorStatus }: { _id: string; operatorStatus: string },
    { models }: IContext
  ) {
    const message = await models.ConversationMessages.createMessage({
      conversationId: _id,
      botData: [
        {
          type: 'text',
          text: AUTO_BOT_MESSAGES.CHANGE_OPERATOR
        }
      ]
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message
    });

    return models.Conversations.updateOne(
      { _id },
      { $set: { operatorStatus } }
    );
  },

  async conversationConvertToCard(
    _root,
    params: IConversationConvert,
    { user, models, subdomain }: IContext
  ) {
    const { _id } = params;

    const conversation = await models.Conversations.getConversation(_id);

    const args = {
      ...params,
      conversation,
      user
    };

    return sendCardsMessage({
      subdomain,
      action: 'conversationConvert',
      data: args,
      isRPC: true
    });
  },

  async conversationEditCustomFields(
    _root,
    { _id, customFieldsData }: { _id: string; customFieldsData: any },
    { models }: IContext
  ) {
    await models.Conversations.updateConversation(_id, { customFieldsData });
    return models.Conversations.getConversation(_id);
  }
};

requireLogin(conversationMutations, 'conversationMarkAsRead');
requireLogin(conversationMutations, 'conversationCreateVideoChatRoom');
requireLogin(conversationMutations, 'conversationConvertToCard');

checkPermission(
  conversationMutations,
  'conversationMessageAdd',
  'conversationMessageAdd'
);
checkPermission(
  conversationMutations,
  'conversationsAssign',
  'assignConversation'
);
checkPermission(
  conversationMutations,
  'conversationsUnassign',
  'assignConversation'
);
checkPermission(
  conversationMutations,
  'conversationsChangeStatus',
  'changeConversationStatus'
);
checkPermission(
  conversationMutations,
  'conversationResolveAll',
  'conversationResolveAll'
);

export default conversationMutations;

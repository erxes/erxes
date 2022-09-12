import * as strip from 'strip';
import * as _ from 'underscore';

import {
  KIND_CHOICES,
  MESSAGE_TYPES
} from '../../models/definitions/constants';

import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { IConversationDocument } from '../../models/definitions/conversations';
import { AUTO_BOT_MESSAGES } from '../../models/definitions/constants';
import { debug } from '../../configs';
import {
  sendContactsMessage,
  sendCardsMessage,
  sendCoreMessage,
  sendIntegrationsMessage,
  sendNotificationsMessage,
  sendToWebhook
} from '../../messageBroker';
import { graphqlPubsub } from '../../configs';

import { putUpdateLog } from '../../logUtils';

import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { splitStr } from '@erxes/api-utils/src/core';
import QueryBuilder, { IListArgs } from '../../conversationQueryBuilder';
import { CONVERSATION_STATUSES } from '../../models/definitions/constants';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IContext, IModels } from '../../connectionResolver';

export interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  facebookMessageTag?: string;
}

interface IReplyFacebookComment {
  conversationId: string;
  commentId: string;
  content: string;
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
  priority?: String;
  assignedUserIds?: [String];
  labelIds?: [String];
  startDate?: Date;
  closeDate?: Date;
  attachments?: IAttachment[];
  description?: String;
}

/**
 *  Send conversation to integrations
 */

const sendConversationToIntegrations = async (
  subdomain: string,
  type: string,
  integrationId: string,
  conversationId: string,
  requestName: string,
  doc: IConversationMessageAdd,
  action?: string,
  facebookMessageTag?: string
) => {
  if (type === 'facebook') {
    const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');

    const images: string[] = (doc.content.match(regex) || []).map(m =>
      m.replace(regex, '$1')
    );

    images.forEach(img => {
      doc.attachments.push({ type: 'image', url: img });
    });

    const content = strip(doc.content);

    try {
      await sendIntegrationsMessage({
        subdomain,
        action: 'api_to_integrations',
        data: {
          action,
          type,
          payload: JSON.stringify({
            integrationId,
            conversationId,
            content: content.replace(/&amp;/g, '&'),
            attachments: doc.attachments || [],
            tag: facebookMessageTag
          })
        },
        isRPC: true
      });
    } catch (e) {
      throw new Error(
        `Your message not sent Error: ${e.message}. Go to integrations list and fix it`
      );
    }
  }

  if (requestName) {
    return sendIntegrationsMessage({
      subdomain,
      action: 'reply',
      data: {
        conversationId,
        integrationId,
        content: strip(doc.content),
        attachments: doc.attachments || [],
        requestName
      },
      isRPC: true
    });
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
export const publishConversationsChanged = (
  _ids: string[],
  type: string
): string[] => {
  for (const _id of _ids) {
    graphqlPubsub.publish('conversationChanged', {
      conversationChanged: { conversationId: _id, type }
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

const sendNotifications = async (
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

    const kind = integration.kind;
    const integrationId = integration.id;
    const conversationId = conversation.id;
    const facebookMessageTag = doc.facebookMessageTag;

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

    if (kind === KIND_CHOICES.LEAD && email) {
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

    let requestName;
    let type;
    let action;

    if (kind === KIND_CHOICES.FACEBOOK_POST) {
      type = 'facebook';
      action = 'reply-post';

      return sendConversationToIntegrations(
        subdomain,
        type,
        integrationId,
        conversationId,
        requestName,
        doc,
        action
      );
    }

    const message = await models.ConversationMessages.addMessage(doc, user._id);

    /**
     * Send SMS only when:
     * - integration is of kind telnyx
     * - customer has primary phone filled
     * - customer's primary phone is valid
     */
    if (
      kind === KIND_CHOICES.TELNYX &&
      customer &&
      customer.primaryPhone &&
      customer.phoneValidationStatus === 'valid'
    ) {
      /**
       * SMS part is limited to 160 characters, so we split long content by 160 characters.
       * See below for details.
       * https://developers.telnyx.com/docs/v2/messaging/configuration-and-limitations/character-and-rate-limits
       */
      const chunks =
        doc.content.length > 160 ? splitStr(doc.content, 160) : [doc.content];

      for (let i = 0; i < chunks.length; i++) {
        await sendIntegrationsMessage({
          subdomain,
          action: 'notification',
          data: {
            action: 'sendConversationSms',
            payload: JSON.stringify({
              conversationMessageId: `${message._id}-part${i + 1}`,
              conversationId,
              integrationId,
              toPhone: customer.primaryPhone,
              content: strip(chunks[i])
            })
          }
        });
      }
    }

    // send reply to facebook
    if (kind === KIND_CHOICES.FACEBOOK_MESSENGER) {
      type = 'facebook';
      action = 'reply-messenger';
    }

    // send reply to chatfuel
    if (kind === KIND_CHOICES.CHATFUEL) {
      requestName = 'replyChatfuel';
    }

    if (kind === KIND_CHOICES.TWITTER_DM) {
      requestName = 'replyTwitterDm';
    }

    if (kind.includes('smooch')) {
      requestName = 'replySmooch';
    }

    // send reply to whatsapp
    if (kind === KIND_CHOICES.WHATSAPP) {
      requestName = 'replyWhatsApp';
    }

    await sendConversationToIntegrations(
      subdomain,
      type,
      integrationId,
      conversationId,
      requestName,
      doc,
      action,
      facebookMessageTag
    );

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

  async conversationsReplyFacebookComment(
    _root,
    doc: IReplyFacebookComment,
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
      type: 'conversationStateChange',
      mobile: true,
      messageContent: doc.content
    });

    const requestName = 'replyFacebookPost';
    const integrationId = integration.id;
    const conversationId = doc.commentId;
    const type = 'facebook';
    const action = 'reply-post';

    await sendConversationToIntegrations(
      subdomain,
      type,
      integrationId,
      conversationId,
      requestName,
      doc,
      action
    );
  },

  async conversationsChangeStatusFacebookComment(
    _root,
    doc: IReplyFacebookComment,
    { subdomain }: IContext
  ) {
    const requestName = 'replyFacebookPost';
    const type = 'facebook';
    const action = 'change-status-comment';
    const conversationId = doc.commentId;
    doc.content = '';

    return sendConversationToIntegrations(
      subdomain,
      type,
      '',
      conversationId,
      requestName,
      doc,
      action
    );
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
    publishConversationsChanged(conversationIds, 'assigneeChanged');

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
    publishConversationsChanged(_ids, 'assigneeChanged');

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
    { user, models, subdomain }: IContext
  ) {
    const { oldConversationById } = await getConversationById(models, {
      _id: { $in: _ids }
    });

    await models.Conversations.changeStatusConversation(_ids, status, user._id);

    // notify graphl subscription
    publishConversationsChanged(_ids, status);

    const updatedConversations = await models.Conversations.find({
      _id: { $in: _ids }
    });

    await sendNotifications(subdomain, {
      user,
      conversations: updatedConversations,
      type: 'conversationStateChange'
    });

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

import * as strip from 'strip';
import * as _ from 'underscore';
import {
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  Integrations
} from '../../../db/models';
import { getCollection } from '../../../db/models/boardUtils';
import Messages from '../../../db/models/ConversationMessages';
import {
  KIND_CHOICES,
  MESSAGE_TYPES,
  NOTIFICATION_CONTENT_TYPES,
  NOTIFICATION_TYPES
} from '../../../db/models/definitions/constants';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../../../db/models/definitions/conversations';
import { IUserDocument } from '../../../db/models/definitions/users';
import { debugError } from '../../../debuggers';
import messageBroker from '../../../messageBroker';
import { graphqlPubsub } from '../../../pubsub';
import { AUTO_BOT_MESSAGES, RABBITMQ_QUEUES } from '../../constants';
import {
  ACTIVITY_LOG_ACTIONS,
  putActivityLog,
  putUpdateLog
} from '../../logUtils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import utils, { splitStr } from '../../utils';
import QueryBuilder, { IListArgs } from '../queries/conversationQueryBuilder';
import { itemsAdd } from './boardUtils';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';

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

interface IConversationConvert {
  _id: string;
  type: string;
  itemId: string;
  stageId: string;
  itemName: string;
}

/**
 *  Send conversation to integrations
 */

const sendConversationToIntegrations = async (
  type: string,
  integrationId: string,
  conversationId: string,
  requestName: string,
  doc: IConversationMessageAdd,
  dataSources: any,
  action?: string,
  facebookMessageTag?: string
) => {
  if (type === 'facebook') {
    const regex = new RegExp('<img[^>]* src="([^"]*)"', 'g');

    const images: string[] = (doc.content.match(regex) || []).map(m =>
      m.replace(regex, '$1')
    );

    const attachments = doc.attachments as any[];

    images.forEach(img => {
      attachments.push({ type: 'image', url: img });
    });

    try {
      await messageBroker().sendRPCMessage(
        RABBITMQ_QUEUES.RPC_API_TO_INTEGRATIONS,
        {
          action,
          type,
          payload: JSON.stringify({
            integrationId,
            conversationId,
            content: strip(doc.content),
            attachments: doc.attachments || [],
            tag: facebookMessageTag
          })
        }
      );
    } catch (e) {
      throw new Error(
        `Your message not sent Error: ${e.message}. Go to integrations list and fix it`
      );
    }
  }

  if (dataSources && dataSources.IntegrationsAPI && requestName) {
    return dataSources.IntegrationsAPI[requestName]({
      conversationId,
      integrationId,
      content: strip(doc.content),
      attachments: doc.attachments || []
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
  message: IMessageDocument,
  customerId?: string
) => {
  graphqlPubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message
  });

  // widget is listening for this subscription to show notification
  // customerId available means trying to notify to client
  if (customerId) {
    const unreadCount = await Messages.widgetsGetUnreadMessagesCount(
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

const sendNotifications = async ({
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
}) => {
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
      contentType: NOTIFICATION_CONTENT_TYPES.CONVERSATION,
      contentTypeId: conversation._id
    };

    switch (type) {
      case NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE:
        doc.action = `sent you a message`;
        doc.receivers = conversationNotifReceivers(conversation, user._id);
        break;
      case NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE:
        doc.action = 'has assigned you to conversation ';
        break;
      case 'unassign':
        doc.notifType = NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE;
        doc.action = 'has removed you from conversation';
        break;
      case NOTIFICATION_TYPES.CONVERSATION_STATE_CHANGE:
        doc.action = `changed conversation status to ${(
          conversation.status || ''
        ).toUpperCase()}`;
        break;
    }

    await utils.sendNotification(doc);

    if (mobile) {
      // send mobile notification ======
      try {
        await utils.sendMobileNotification({
          title: doc.title,
          body: strip(doc.content),
          receivers: conversationNotifReceivers(conversation, user._id, false),
          customerId: conversation.customerId,
          conversationId: conversation._id
        });
      } catch (e) {
        debugError(`Failed to send mobile notification: ${e.message}`);
      }
    }
  }
};

const getConversationById = async selector => {
  const oldConversations = await Conversations.find(selector).lean();
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
    { user, dataSources }: IContext
  ) {
    const conversation = await Conversations.getConversation(
      doc.conversationId
    );
    const integration = await Integrations.getIntegration({
      _id: conversation.integrationId
    });

    await sendNotifications({
      user,
      conversations: [conversation],
      type: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      mobile: true,
      messageContent: doc.content
    });

    // do not send internal message to third service integrations
    if (doc.internal) {
      const messageObj = await ConversationMessages.addMessage(doc, user._id);

      // publish new message to conversation detail
      publishMessage(messageObj);

      return messageObj;
    }

    const kind = integration.kind;
    const integrationId = integration.id;
    const conversationId = conversation.id;
    const facebookMessageTag = doc.facebookMessageTag;

    const customer = await Customers.findOne({ _id: conversation.customerId });

    // if conversation's integration kind is form then send reply to
    // customer's email
    const email = customer ? customer.primaryEmail : '';

    if (kind === KIND_CHOICES.LEAD && email) {
      utils.sendEmail({
        toEmails: [email],
        title: 'Reply',
        template: {
          data: doc.content
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
        type,
        integrationId,
        conversationId,
        requestName,
        doc,
        dataSources,
        action
      );
    }

    const message = await ConversationMessages.addMessage(doc, user._id);

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
        await messageBroker().sendMessage(
          'erxes-api:integrations-notification',
          {
            action: 'sendConversationSms',
            payload: JSON.stringify({
              conversationMessageId: `${message._id}-part${i + 1}`,
              conversationId,
              integrationId,
              toPhone: customer.primaryPhone,
              content: strip(chunks[i])
            })
          }
        );
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
      type,
      integrationId,
      conversationId,
      requestName,
      doc,
      dataSources,
      action,
      facebookMessageTag
    );

    const dbMessage = await ConversationMessages.getMessage(message._id);

    await utils.sendToWebhook('create', 'userMessages', dbMessage);
    // Publishing both admin & client
    publishMessage(dbMessage, conversation.customerId);

    return dbMessage;
  },

  async conversationsReplyFacebookComment(
    _root,
    doc: IReplyFacebookComment,
    { user, dataSources }: IContext
  ) {
    const conversation = await Conversations.getConversation(
      doc.conversationId
    );
    const integration = await Integrations.getIntegration({
      _id: conversation.integrationId
    });

    await sendNotifications({
      user,
      conversations: [conversation],
      type: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      mobile: true,
      messageContent: doc.content
    });

    const requestName = 'replyFacebookPost';
    const integrationId = integration.id;
    const conversationId = doc.commentId;
    const type = 'facebook';
    const action = 'reply-post';

    await sendConversationToIntegrations(
      type,
      integrationId,
      conversationId,
      requestName,
      doc,
      dataSources,
      action
    );
  },

  async conversationsChangeStatusFacebookComment(
    _root,
    doc: IReplyFacebookComment,
    { dataSources }: IContext
  ) {
    const requestName = 'replyFacebookPost';
    const type = 'facebook';
    const action = 'change-status-comment';
    const conversationId = doc.commentId;
    doc.content = '';

    return sendConversationToIntegrations(
      type,
      '',
      conversationId,
      requestName,
      doc,
      dataSources,
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
    { user }: IContext
  ) {
    const { oldConversationById } = await getConversationById({
      _id: { $in: conversationIds }
    });

    const conversations: IConversationDocument[] = await Conversations.assignUserConversation(
      conversationIds,
      assignedUserId
    );

    // notify graphl subscription
    publishConversationsChanged(conversationIds, 'assigneeChanged');

    await sendNotifications({
      user,
      conversations,
      type: NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE
    });

    for (const conversation of conversations) {
      await putUpdateLog(
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
    { user }: IContext
  ) {
    const {
      oldConversations,
      oldConversationById
    } = await getConversationById({ _id: { $in: _ids } });
    const updatedConversations = await Conversations.unassignUserConversation(
      _ids
    );

    await sendNotifications({
      user,
      conversations: oldConversations,
      type: 'unassign'
    });

    // notify graphl subscription
    publishConversationsChanged(_ids, 'assigneeChanged');

    for (const conversation of updatedConversations) {
      await putUpdateLog(
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
    { user }: IContext
  ) {
    const { oldConversationById } = await getConversationById({
      _id: { $in: _ids }
    });

    await Conversations.changeStatusConversation(_ids, status, user._id);

    // notify graphl subscription
    publishConversationsChanged(_ids, status);

    const updatedConversations = await Conversations.find({
      _id: { $in: _ids }
    });

    await sendNotifications({
      user,
      conversations: updatedConversations,
      type: NOTIFICATION_TYPES.CONVERSATION_STATE_CHANGE
    });

    for (const conversation of updatedConversations) {
      await putUpdateLog(
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
  async conversationResolveAll(_root, params: IListArgs, { user }: IContext) {
    // initiate query builder
    const qb = new QueryBuilder(params, { _id: user._id });

    await qb.buildAllQueries();
    const query = qb.mainQuery();

    const { oldConversationById } = await getConversationById(query);
    const param = {
      status: CONVERSATION_STATUSES.CLOSED,
      closedUserId: user._id,
      closedAt: new Date()
    };

    const updated = await Conversations.resolveAllConversation(query, param);

    const updatedConversations = await Conversations.find({
      _id: { $in: Object.keys(oldConversationById) }
    }).lean();

    for (const conversation of updatedConversations) {
      await putUpdateLog(
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
    { user }: IContext
  ) {
    return Conversations.markAsReadConversation(_id, user._id);
  },

  async conversationDeleteVideoChatRoom(
    _root,
    { name },
    { dataSources }: IContext
  ) {
    try {
      return await dataSources.IntegrationsAPI.deleteDailyVideoChatRoom(name);
    } catch (e) {
      debugError(e.message);

      throw new Error(e.message);
    }
  },

  async conversationCreateVideoChatRoom(
    _root,
    { _id },
    { dataSources, user }: IContext
  ) {
    let message;

    try {
      const doc = {
        conversationId: _id,
        internal: false,
        contentType: MESSAGE_TYPES.VIDEO_CALL
      };

      message = await ConversationMessages.addMessage(doc, user._id);

      const videoCallData = await dataSources.IntegrationsAPI.createDailyVideoChatRoom(
        {
          erxesApiConversationId: _id,
          erxesApiMessageId: message._id
        }
      );

      const updatedMessage = { ...message._doc, videoCallData };

      // publish new message to conversation detail
      publishMessage(updatedMessage);

      return videoCallData;
    } catch (e) {
      debugError(e.message);

      await ConversationMessages.deleteOne({ _id: message._id });

      throw new Error(e.message);
    }
  },

  async changeConversationOperator(
    _root,
    { _id, operatorStatus }: { _id: string; operatorStatus: string }
  ) {
    const message = await Messages.createMessage({
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

    return Conversations.updateOne({ _id }, { $set: { operatorStatus } });
  },

  async conversationsSaveVideoRecordingInfo(
    _root,
    {
      conversationId,
      recordingId
    }: { conversationId: string; recordingId: string },
    { dataSources }: IContext
  ) {
    try {
      const response = await dataSources.IntegrationsAPI.saveDailyRecordingInfo(
        {
          erxesApiConversationId: conversationId,
          recordingId
        }
      );

      return response.status;
    } catch (e) {
      debugError(e);

      throw new Error(e.message);
    }
  },

  async conversationConvertToCard(
    _root,
    params: IConversationConvert,
    { user, docModifier }: IContext
  ) {
    const { _id, type, itemId, itemName, stageId } = params;

    const conversation = await Conversations.getConversation(_id);

    const { collection, update, create } = getCollection(type);

    if (itemId) {
      const oldItem = await collection.findOne({ _id: itemId }).lean();

      const doc = oldItem;

      if (conversation.assignedUserId) {
        const assignedUserIds = oldItem.assignedUserIds || [];
        assignedUserIds.push(conversation.assignedUserId);

        doc.assignedUserIds = assignedUserIds;
      }

      const sourceConversationIds: string[] =
        oldItem.sourceConversationIds || [];

      sourceConversationIds.push(conversation._id);

      doc.sourceConversationIds = sourceConversationIds;

      const item = await update(oldItem._id, doc);

      item.userId = user._id;

      await putActivityLog({
        action: ACTIVITY_LOG_ACTIONS.CREATE_BOARD_ITEM,
        data: { item, contentType: type }
      });

      const relTypeIds: string[] = [];

      sourceConversationIds.forEach(async conversationId => {
        const con = await Conversations.getConversation(conversationId);

        if (con.customerId) {
          relTypeIds.push(con.customerId);
        }
      });

      if (conversation.customerId) {
        await Conformities.addConformity({
          mainType: type,
          mainTypeId: item._id,
          relType: 'customer',
          relTypeId: conversation.customerId
        });
      }

      return item._id;
    } else {
      const doc: any = {};

      doc.name = itemName;
      doc.stageId = stageId;
      doc.sourceConversationIds = [_id];
      doc.customerIds = [conversation.customerId];
      doc.assignedUserIds = [conversation.assignedUserId];

      const item = await itemsAdd(doc, type, create, user, docModifier);

      return item._id;
    }
  },

  async conversationEditCustomFields(
    _root,
    { _id, customFieldsData }: { _id: string; customFieldsData: any }
  ) {
    await Conversations.updateConversation(_id, { customFieldsData });
    return Conversations.getConversation(_id);
  }
};

requireLogin(conversationMutations, 'conversationMarkAsRead');
requireLogin(conversationMutations, 'conversationDeleteVideoChatRoom');
requireLogin(conversationMutations, 'conversationCreateVideoChatRoom');
requireLogin(conversationMutations, 'conversationsSaveVideoRecordingInfo');
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

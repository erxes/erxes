import * as strip from 'strip';
import * as _ from 'underscore';
import {
  ConversationMessages,
  Conversations,
  Customers,
  Integrations,
  Tags
} from '../../../db/models';
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
import { debugExternalApi } from '../../../debuggers';
import messageBroker from '../../../messageBroker';
import { graphqlPubsub } from '../../../pubsub';
import { AUTO_BOT_MESSAGES } from '../../constants';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import utils from '../../utils';
import QueryBuilder, { IListArgs } from '../queries/conversationQueryBuilder';

export interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
}

interface IReplyFacebookComment {
  conversationId: string;
  commentId: string;
  content: string;
}

/**
 *  Send conversation to integrations
 */

const sendConversationToIntegrations = (
  type: string,
  integrationId: string,
  conversationId: string,
  requestName: string,
  doc: IConversationMessageAdd,
  dataSources: any,
  action?: string
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

    return messageBroker().sendMessage('erxes-api:integrations-notification', {
      action,
      type,
      payload: JSON.stringify({
        integrationId,
        conversationId,
        content: strip(doc.content),
        attachments: doc.attachments || []
      })
    });
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
      await utils.sendMobileNotification({
        title: doc.title,
        body: strip(doc.content),
        receivers: conversationNotifReceivers(conversation, user._id, false),
        customerId: conversation.customerId,
        conversationId: conversation._id
      });
    }
  }
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
    const integration = await Integrations.getIntegration(
      conversation.integrationId
    );

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
     * - content length within 160 characters
     */
    if (
      kind === KIND_CHOICES.TELNYX &&
      customer &&
      customer.primaryPhone &&
      customer.phoneValidationStatus === 'valid' &&
      doc.content.length <= 160
    ) {
      await messageBroker().sendMessage('erxes-api:integrations-notification', {
        action: 'sendConversationSms',
        payload: JSON.stringify({
          conversationMessageId: message._id,
          conversationId,
          integrationId,
          toPhone: customer.primaryPhone,
          content: strip(doc.content)
        })
      });
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
      action
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
    const integration = await Integrations.getIntegration(
      conversation.integrationId
    );

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

    try {
      await sendConversationToIntegrations(
        type,
        integrationId,
        conversationId,
        requestName,
        doc,
        dataSources,
        action
      );
    } catch (e) {
      debugExternalApi(e.message);
      throw new Error(e.message);
    }
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

    try {
      await sendConversationToIntegrations(
        type,
        '',
        conversationId,
        requestName,
        doc,
        dataSources,
        action
      );
    } catch (e) {
      debugExternalApi(e.message);
      throw new Error(e.message);
    }
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
    const oldConversations = await Conversations.find({ _id: { $in: _ids } });
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

    const updated = await Conversations.resolveAllConversation(query, user._id);

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
      debugExternalApi(e.message);

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
      debugExternalApi(e.message);

      await ConversationMessages.deleteOne({ _id: message._id });

      throw new Error(e.message);
    }
  },

  async conversationCreateProductBoardNote(
    _root,
    { _id },
    { dataSources, user }: IContext
  ) {
    const conversation = await Conversations.findOne({ _id })
      .select('customerId userId tagIds, integrationId')
      .lean();
    const tags = await Tags.find({ _id: { $in: conversation.tagIds } }).select(
      'name'
    );
    const customer = await Customers.findOne({ _id: conversation.customerId });
    const messages = await ConversationMessages.find({
      conversationId: _id
    }).sort({
      createdAt: 1
    });
    const integrationId = conversation.integrationId;

    try {
      const productBoardLink = await dataSources.IntegrationsAPI.createProductBoardNote(
        {
          erxesApiConversationId: _id,
          tags,
          customer,
          messages,
          user,
          integrationId
        }
      );

      return productBoardLink;
    } catch (e) {
      debugExternalApi(e.message);

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

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message
    });
    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message
    });

    return Conversations.updateOne({ _id }, { $set: { operatorStatus } });
  }
};

requireLogin(conversationMutations, 'conversationMarkAsRead');

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

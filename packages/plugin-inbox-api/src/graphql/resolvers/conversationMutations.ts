import * as _ from 'underscore';

import { ConversationMessages, Conversations, Integrations } from '../../models';
import { IConversationDocument } from '../../models/definitions/conversations';
import { IUserDocument } from '@erxes/common-types';
import { IContext } from '@erxes/api-utils';
import { AUTO_BOT_MESSAGES, CONVERSATION_STATUSES } from '../../models/definitions/constants';
import QueryBuilder, { IListArgs } from './conversationQueryBuilder';
import Messages from '../../models/ConversationMessages';

import { requireLogin, checkPermission } from '@erxes/api-utils/src/permissions'

export interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  facebookMessageTag?: string;
}

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
	console.log('send notif')
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
      type: 'NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE',
      mobile: true,
      messageContent: doc.content
    });

    // do not send internal message to third service integrations
    if (doc.internal) {
      const messageObj = await ConversationMessages.addMessage(doc, user._id);

      return messageObj;
    }

    const integrationId = integration.id;
    const conversationId = conversation.id;

    const message = await ConversationMessages.addMessage(doc, user._id);

    const dbMessage = await ConversationMessages.getMessage(message._id);

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
    { user }: IContext
  ) {
    const conversations: IConversationDocument[] = await Conversations.assignUserConversation(
      conversationIds,
      assignedUserId
    );

    await sendNotifications({
      user,
      conversations,
      type: 'NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE'
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

    const updatedConversations = await Conversations.find({
      _id: { $in: _ids }
    });

    await sendNotifications({
      user,
      conversations: updatedConversations,
      type: 'NOTIFICATION_TYPES.CONVERSATION_STATE_CHANGE'
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

    return Conversations.updateOne({ _id }, { $set: { operatorStatus } });
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

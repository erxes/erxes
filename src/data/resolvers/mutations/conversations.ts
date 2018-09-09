import * as strip from 'strip';
import * as _ from 'underscore';
import { ConversationMessages, Conversations, Customers, Integrations } from '../../../db/models';
import { CONVERSATION_STATUSES, KIND_CHOICES, NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IMessageDocument } from '../../../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../../../db/models/definitions/conversations';
import { IMessengerData } from '../../../db/models/definitions/integrations';
import { IUserDocument } from '../../../db/models/definitions/users';
import { facebookReply, IFacebookReply } from '../../../trackers/facebook';
import { favorite, retweet, tweet, tweetReply } from '../../../trackers/twitter';
import { requireLogin } from '../../permissions';
import utils from '../../utils';
import { pubsub } from '../subscriptions';

interface IConversationMessageAdd {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  tweetReplyToId?: string;
  tweetReplyToScreenName?: string;
  commentReplyToId?: string;
}

/**
 * conversation notrification receiver ids
 */
export const conversationNotifReceivers = (conversation: IConversationDocument, currentUserId: string): string[] => {
  let userIds: string[] = [];

  // assigned user can get notifications
  if (conversation.assignedUserId) {
    userIds.push(conversation.assignedUserId);
  }

  // participated users can get notifications
  if (conversation.participatedUserIds) {
    userIds = _.union(userIds, conversation.participatedUserIds);
  }

  // exclude current user
  userIds = _.without(userIds, currentUserId);

  return userIds;
};

/**
 * Using this subscription to track conversation detail's assignee, tag, status
 * changes
 */
export const publishConversationsChanged = (_ids: string[], type: string): string[] => {
  for (const _id of _ids) {
    pubsub.publish('conversationChanged', {
      conversationChanged: { conversationId: _id, type },
    });
  }

  return _ids;
};

/**
 * Publish admin's message
 */
export const publishMessage = (message?: IMessageDocument | null, customerId?: string) => {
  if (!message) {
    return;
  }

  pubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message,
  });

  // widget is listening for this subscription to show notification
  // customerId available means trying to notify to client
  if (customerId) {
    pubsub.publish('conversationAdminMessageInserted', {
      conversationAdminMessageInserted: { ...message.toJSON(), customerId },
    });
  }
};
/**
 * Publish conversation client message inserted
 */
export const publishClientMessage = (message: IMessageDocument) => {
  // notifying to total unread count
  pubsub.publish('conversationClientMessageInserted', {
    conversationClientMessageInserted: message,
  });
};

const conversationMutations = {
  /**
   * Calling this mutation from widget api run new message subscription
   */
  async conversationPublishClientMessage(_root, { _id }: { _id: string }) {
    const message = await ConversationMessages.findOne({ _id });

    if (!message) {
      throw new Error('Message not found');
    }

    // notifying to conversationd detail
    publishMessage(message);

    // notifying to total unread count
    publishClientMessage(message);
  },

  /**
   * Create new message in conversation
   */
  async conversationMessageAdd(_root, doc: IConversationMessageAdd, { user }: { user: IUserDocument }) {
    const conversation = await Conversations.findOne({
      _id: doc.conversationId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const integration = await Integrations.findOne({
      _id: conversation.integrationId,
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    // send notification =======
    const title = 'You have a new message.';

    utils.sendNotification({
      createdUser: user._id,
      notifType: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      title,
      content: doc.content,
      link: `/inbox?_id=${conversation._id}`,
      receivers: conversationNotifReceivers(conversation, user._id),
    });

    // do not send internal message to third service integrations
    if (doc.internal) {
      const messageObj = await ConversationMessages.addMessage(doc, user._id);

      // publish new message to conversation detail
      publishMessage(messageObj);

      return messageObj;
    }

    const kind = integration.kind;

    // send reply to twitter
    if (kind === KIND_CHOICES.TWITTER) {
      await tweetReply({
        conversation,
        text: strip(doc.content),
        toId: doc.tweetReplyToId,
        toScreenName: doc.tweetReplyToScreenName,
      });

      return null;
    }

    const customer = await Customers.findOne({ _id: conversation.customerId });

    // if conversation's integration kind is form then send reply to
    // customer's email
    const email = customer ? customer.primaryEmail : '';

    if (kind === KIND_CHOICES.FORM && email) {
      utils.sendEmail({
        to: email,
        title: 'Reply',
        template: {
          data: doc.content,
        },
      });
    }

    const message = await ConversationMessages.addMessage(doc, user._id);

    // send reply to facebook
    if (kind === KIND_CHOICES.FACEBOOK) {
      const msg: IFacebookReply = {
        text: strip(doc.content),
      };

      // attaching parent comment id if replied to comment
      if (doc.commentReplyToId) {
        msg.commentId = doc.commentReplyToId;
      }

      // attaching attachment if sent
      if (doc.attachments.length > 0) {
        msg.attachment = doc.attachments[0];
      }

      // when facebook kind is feed, assign commentId in extraData
      await facebookReply(conversation, msg, message);
    }

    const dbMessage = await ConversationMessages.findOne({
      _id: message._id,
    });

    // Publishing both admin & client
    publishMessage(dbMessage, conversation.customerId);

    return dbMessage;
  },

  /**
   * Tweet
   */
  async conversationsTweet(_root, doc: { integrationId: string; text: string }) {
    return tweet(doc);
  },

  /**
   * Retweet
   */
  async conversationsRetweet(_root, doc: { integrationId: string; id: string }) {
    return retweet(doc);
  },

  /**
   * Favorite
   */
  async conversationsFavorite(_root, doc: { integrationId: string; id: string }) {
    return favorite(doc);
  },

  /**
   * Assign employee to conversation
   */
  async conversationsAssign(
    _root,
    { conversationIds, assignedUserId }: { conversationIds: string[]; assignedUserId: string },
    { user }: { user: IUserDocument },
  ) {
    const updatedConversations: IConversationDocument[] = await Conversations.assignUserConversation(
      conversationIds,
      assignedUserId,
    );

    // notify graphl subscription
    publishConversationsChanged(conversationIds, 'assigneeChanged');

    for (const conversation of updatedConversations) {
      const content = 'Assigned user has changed';

      // send notification
      utils.sendNotification({
        createdUser: user._id,
        notifType: NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE,
        title: content,
        content,
        link: `/inbox?_id=${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, user._id),
      });
    }

    return updatedConversations;
  },

  /**
   * Unassign employee from conversation
   */
  async conversationsUnassign(_root, { _ids }: { _ids: string[] }) {
    const conversations = await Conversations.unassignUserConversation(_ids);

    // notify graphl subscription
    publishConversationsChanged(_ids, 'assigneeChanged');

    return conversations;
  },

  /**
   * Change conversation status
   */
  async conversationsChangeStatus(
    _root,
    { _ids, status }: { _ids: string[]; status: string },
    { user }: { user: IUserDocument },
  ) {
    const { conversations } = await Conversations.checkExistanceConversations(_ids);

    await Conversations.changeStatusConversation(_ids, status, user._id);

    // notify graphl subscription
    publishConversationsChanged(_ids, status);

    for (const conversation of conversations) {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        const customer = await Customers.findOne({
          _id: conversation.customerId,
        });

        if (!customer) {
          throw new Error('Customer not found');
        }

        const integration = await Integrations.findOne({
          _id: conversation.integrationId,
        });

        if (!integration) {
          throw new Error('Integration not found');
        }

        const messengerData: IMessengerData = integration.messengerData || {};
        const notifyCustomer = messengerData.notifyCustomer || false;

        if (notifyCustomer && customer.primaryEmail) {
          // send email to customer
          utils.sendEmail({
            to: customer.primaryEmail,
            subject: 'Conversation detail',
            template: {
              name: 'conversationDetail',
              data: {
                conversationDetail: {
                  title: 'Conversation detail',
                  messages: await ConversationMessages.find({
                    conversationId: conversation._id,
                  }),
                  date: new Date(),
                },
              },
            },
          });
        }
      }

      const content = 'Conversation status has changed.';

      utils.sendNotification({
        createdUser: user._id,
        notifType: NOTIFICATION_TYPES.CONVERSATION_STATE_CHANGE,
        title: content,
        content,
        link: `/inbox?_id=${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, user._id),
      });
    }

    return Conversations.find({ _id: { $in: _ids } });
  },

  /**
   * Conversation mark as read
   */
  async conversationMarkAsRead(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    return Conversations.markAsReadConversation(_id, user._id);
  },
};

requireLogin(conversationMutations, 'conversationMessageAdd');
requireLogin(conversationMutations, 'conversationsAssign');
requireLogin(conversationMutations, 'conversationsUnassign');
requireLogin(conversationMutations, 'conversationsChangeStatus');
requireLogin(conversationMutations, 'conversationMarkAsRead');

export default conversationMutations;

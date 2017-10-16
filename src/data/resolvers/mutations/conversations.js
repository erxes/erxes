import { Conversations, ConversationMessages, Integrations, Customers } from '../../../db/models';
import { pubsub } from '../subscriptions';
import { CONVERSATION_STATUSES, KIND_CHOICES } from '../../constants';
import utils from '../../utils';
import { _ } from 'underscore';

/**
 * conversation notrification receiver ids
 * @param  {object} conversation object
 * @param  {String} currentUserId String
 * @return {list} userIds
 */
export const conversationNotifReceivers = (conversation, currentUserId) => {
  let userIds = [];

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
 * Publish updated conversation
 * @param  {list} _ids of conversations
 * @param  {String} type of status
 */
const conversationsChanged = async (_ids, type) => {
  for (let _id of _ids) {
    const conversation = await Conversations.findOne({ _id });

    // notify new message
    pubsub.publish('conversationChanged', {
      conversationChanged: { conversationId: _id, type },
    });

    if (conversation) {
      pubsub.publish('conversationsChanged', {
        conversationsChanged: { customerId: conversation.customerId, type },
      });
    }
  }
  return _ids;
};

/**
 * Publish created message
 * @param  {Object} message object
 * @param  {String} conversationId
 */
const conversationMessageCreated = async (message, conversationId) => {
  // subscribe
  pubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message,
  });

  const conversation = await Conversations.findOne({ _id: conversationId });

  pubsub.publish('conversationsChanged', {
    conversationsChanged: { customerId: conversation.customerId, type: 'newMessage' },
  });
};

export default {
  /**
   * Create new message in conversation
   * @param  {Object} doc contains conversation message inputs
   * @return {Promise} messageId
   */
  async conversationMessageAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    const message = await ConversationMessages.addMessage(doc, user._id);

    const conversation = await Conversations.findOne({ _id: doc.conversationId });
    const title = 'You have a new message.';

    // send notification
    utils.sendNotification({
      createdUser: user._id,
      notifType: 'conversationAddMessage',
      title,
      content: doc.content,
      link: `/inbox/details/${conversation._id}`,
      receivers: conversationNotifReceivers(conversation, user._id),
    });

    // do not send internal message to third service integrations
    if (doc.internal) {
      return message;
    }

    const integration = await Integrations.findOne({ _id: conversation.integrationId });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const kind = integration.kind;

    // send reply to twitter
    if (kind === KIND_CHOICES.TWITTER) {
      // TODO: return tweetReply(conversation, strip(content));
    }

    const customer = await Customers.findOne({ _id: conversation.customerId });

    // if conversation's integration kind is form then send reply to
    // customer's email
    const email = customer ? customer.email : '';

    if (kind === KIND_CHOICES.FORM && email) {
      utils.sendEmail({
        to: email,
        title: 'Reply',
        template: {
          data: doc.content,
        },
      });
    }

    // send reply to facebook
    if (kind === KIND_CHOICES.FACEBOOK) {
      // when facebook kind is feed, assign commentId in extraData
      // TODO: facebookReply(conversation, strip(content), messageId);
    }

    await conversationMessageCreated(message, doc.conversationId);

    return message._id;
  },

  /**
   * Assign employee to conversation
   * @param  {list} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} String
   */
  async conversationsAssign(root, { conversationIds, assignedUserId }, { user }) {
    if (!user) throw new Error('Login required');

    const updatedConversations = await Conversations.assignUserConversation(
      conversationIds,
      assignedUserId,
    );

    // notify graphl subscription
    await conversationsChanged(conversationIds, 'statusChanged');

    for (let conversation of updatedConversations) {
      const content = 'Assigned user has changed';

      // send notification
      utils.sendNotification({
        createdUser: user._id,
        notifType: 'conversationAssigneeChange',
        title: content,
        content,
        link: `/inbox/details/${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, user._id),
      });
    }

    return updatedConversations;
  },

  /**
   * Unassign employee from conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsUnassign(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    const conversations = await Conversations.unassignUserConversation(_ids);

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');

    return conversations;
  },

  /**
   * Change conversation status
   * @param  {list} _ids of conversation
   * @param  {String} status
   * @return {Promise} String
   */
  async conversationsChangeStatus(root, { _ids, status }, { user }) {
    if (!user) throw new Error('Login required');

    const { conversations } = await Conversations.checkExistanceConversations(_ids);

    const changesConversations = await Conversations.changeStatusConversation(_ids, status);

    // notify graphl subscription
    await conversationsChanged(_ids, 'statusChanged');

    for (let conversation of conversations) {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        const customer = await Customers.findOne({ _id: conversation.customerId });
        const integration = await Integrations.findOne({ _id: conversation.integrationId });
        const messengerData = integration.messengerData || {};
        const notifyCustomer = messengerData.notifyCustomer || false;

        if (notifyCustomer && customer.email) {
          // send email to customer
          utils.sendEmail({
            to: customer.email,
            subject: 'Conversation detail',
            templateArgs: {
              name: 'conversationDetail',
              data: {
                conversationDetail: {
                  title: 'Conversation detail',
                  messages: await ConversationMessages.find({ conversationId: conversation._id }),
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
        notifType: 'conversationStateChange',
        title: content,
        content,
        link: `/inbox/details/${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, user._id),
      });
    }

    return changesConversations;
  },

  /**
   * Star conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsStar(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    return Conversations.starConversation(_ids, user._id);
  },

  /**
   * Unstar conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsUnstar(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    return Conversations.unstarConversation(_ids, user._id);
  },

  /**
   * Add or remove participed users in conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsToggleParticipate(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    const conversations = await Conversations.toggleParticipatedUsers(_ids, user._id);

    // notify graphl subscription
    conversationsChanged(_ids, 'participatedStateChanged');

    return conversations;
  },

  /**
   * Conversation mark as read
   * @param  {String} _id of conversation
   * @return {Promise} String
   */
  async conversationMarkAsRead(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return Conversations.markAsReadConversation(_id, user._id);
  },
};

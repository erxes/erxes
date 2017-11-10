import { Conversations, ConversationMessages, Integrations, Customers } from '../../../db/models';
import { NOTIFICATION_TYPES } from '../../constants';
import { pubsub } from '../subscriptions';
import { CONVERSATION_STATUSES, KIND_CHOICES } from '../../constants';
import utils from '../../utils';
import { _ } from 'underscore';
import { moduleRequireLogin } from '../../permissions';

/**
 * conversation notrification receiver ids
 * @param  {object} conversation object
 * @param  {String} currentUserId String
 * @return {[String]} userIds
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
 * @param  {[String]} _ids of conversations
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

const conversationMutations = {
  /**
   * Create new message in conversation
   * @param  {Object} doc contains conversation message inputs
   * @return {Promise} newly created message object
   */
  async conversationMessageAdd(root, doc, { user }) {
    const message = await ConversationMessages.addMessage(doc, user._id);

    const conversation = await Conversations.findOne({ _id: doc.conversationId });
    const title = 'You have a new message.';

    // send notification
    utils.sendNotification({
      createdUser: user._id,
      notifType: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      title,
      content: doc.content,
      link: `/inbox/details/${conversation._id}`,
      receivers: conversationNotifReceivers(conversation, user._id),
    });

    // do not send internal message to third service integrations
    if (doc.internal) {
      // notify subscription
      await conversationMessageCreated(message, doc.conversationId);

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

    // notify subscription
    await conversationMessageCreated(message, doc.conversationId);

    return message;
  },

  /**
   * Assign employee to conversation
   * @param  {[String]} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} object list of assigned conversations
   */
  async conversationsAssign(root, { conversationIds, assignedUserId }, { user }) {
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
        notifType: NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE,
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
   * @param  {[String]} _ids of conversation
   * @return {Promise} unassigned conversations
   */
  async conversationsUnassign(root, { _ids }) {
    const conversations = await Conversations.unassignUserConversation(_ids);

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');

    return conversations;
  },

  /**
   * Change conversation status
   * @param  {[String]} _ids of conversation
   * @param  {String} status
   * @return {Promise} object list of updated conversations
   */
  async conversationsChangeStatus(root, { _ids, status }, { user }) {
    const { conversations } = await Conversations.checkExistanceConversations(_ids);

    await Conversations.changeStatusConversation(_ids, status);

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
        notifType: NOTIFICATION_TYPES.CONVERSATION_STATE_CHANGE,
        title: content,
        content,
        link: `/inbox/details/${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, user._id),
      });
    }

    return Conversations.find({ _id: { $in: _ids } });
  },

  /**
   * Star conversation
   * @param  {list} _ids of conversation
   * @return {Promise} user object of starred conversations
   */
  async conversationsStar(root, { _ids }, { user }) {
    return Conversations.starConversation(_ids, user._id);
  },

  /**
   * Unstar conversation
   * @param  {list} _ids of conversation
   * @return {Promise} user object from unstarred conversations
   */
  async conversationsUnstar(root, { _ids }, { user }) {
    return Conversations.unstarConversation(_ids, user._id);
  },

  /**
   * Add or remove participed users in conversation
   * @param  {list} _ids of conversation
   * @return {Promise} updated conversations
   */
  async conversationsToggleParticipate(root, { _ids }, { user }) {
    const conversations = await Conversations.toggleParticipatedUsers(_ids, user._id);

    // notify graphl subscription
    conversationsChanged(_ids, 'participatedStateChanged');

    return conversations;
  },

  /**
   * Conversation mark as read
   * @param  {String} _id of conversation
   * @return {Promise} Conversation object with mark as read
   */
  async conversationMarkAsRead(root, { _id }, { user }) {
    return Conversations.markAsReadConversation(_id, user._id);
  },
};

moduleRequireLogin(conversationMutations);

export default conversationMutations;

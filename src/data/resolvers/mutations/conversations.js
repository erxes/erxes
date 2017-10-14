import { Conversations, ConversationMessages } from '../../../db/models';
import { pubsub } from '../subscriptions';
import { CONVERSATION_STATUSES } from '../../constants';
import { sendEmail } from '../../utils';

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

    pubsub.publish('conversationsChanged', {
      conversationsChanged: { customerId: conversation.customerId, type },
    });
  }
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

  const conversation = Conversations.findOne({ _id: conversationId });
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

    await Conversations.assignUserConversation(conversationIds, assignedUserId);

    // notify graphl subscription
    await conversationsChanged(conversationIds, 'statusChanged');

    return 'done';
  },

  /**
   * Unassign employee from conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsUnassign(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await Conversations.unassignUserConversation(_ids);

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');

    return 'done';
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

    await Conversations.changeStatusConversation(_ids, status);

    // notify graphl subscription
    await conversationsChanged(_ids, 'statusChanged');

    conversations.forEach(async conversation => {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        const customer = conversation.customer();
        const integration = conversation.integration();
        const messengerData = integration.messengerData || {};
        const notifyCustomer = messengerData.notifyCustomer || false;

        if (notifyCustomer && customer.email) {
          // send email to customer
          sendEmail({
            to: customer.email,
            title: 'Conversation detail',
            content: await ConversationMessages.find({ conversationId: conversation._id }),
          });
        }
      }
    });

    const content = 'Conversation status has changed.';

    // TODO: send notification

    return 'done';
  },

  /**
   * Star conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsStar(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await Conversations.starConversation(_ids, user._id);

    return 'done';
  },

  /**
   * Unstar conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsUnstar(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await Conversations.unstarConversation(_ids, user._id);

    return 'done';
  },

  /**
   * Add or remove participed users in conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsToggleParticipate(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await Conversations.toggleParticipatedUsers(_ids, user._id);

    // notify graphl subscription
    conversationsChanged(_ids, 'participatedStateChanged');

    return 'done';
  },

  /**
   * Conversation mark as read
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationMarkAsRead(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    await Conversations.markAsReadConversation(_id, user._id);

    return 'done';
  },
};

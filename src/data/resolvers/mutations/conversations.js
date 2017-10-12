import strip from 'strip';

import {
  Conversations,
  ConversationMessages,
  Users,
  Integrations,
  Customers,
} from '../../../db/models';
import { pubsub } from '../subscriptions';
import { KIND_CHOICES, CONVERSATION_STATUSES } from '../../constants';

const conversationsCheckExistance = async _ids => {
  const selector = { _id: { $in: _ids } };
  const conversations = await Conversations.find(selector);

  if (conversations.length !== _ids.length) {
    throw new Error('Conversation not found.');
  }

  return { selector, conversations };
};

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

const createMessage = async (conversation, doc, userId) => {
  const message = await ConversationMessages.createMessage({ ...doc, userId });

  // subscribe
  pubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message,
  });

  pubsub.publish('conversationsChanged', {
    conversationsChanged: { customerId: conversation.customerId, type: 'newMessage' },
  });

  return message._id;
};

export default {
  /**
   * Create new message in conversation
   * @param  {Object} doc contains conversation message inputs
   * @return {Promise} messageId
   */
  async conversationMessageAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    const conversation = await Conversations.findOne({ _id: doc.conversationId });

    if (!conversation) throw new Error('Conversation not found');

    // normalize content, attachments
    const content = doc.content || '';
    const attachments = doc.attachments || [];

    doc.content = content;
    doc.attachments = attachments;

    // if there is no attachments and no content then throw content required
    // error
    if (attachments.length === 0 && !strip(content)) throw new Error('Content is required');

    // setting conversation's content to last message
    Conversations.update({ _id: doc.conversationId }, { $set: { content } });

    // TODO: send notification

    const userId = user._id;

    // do not send internal message to third service integrations
    if (doc.internal) {
      return createMessage(conversation, doc, userId);
    }

    const integration = await Integrations.findOne({ _id: conversation.integrationId });

    if (!integration) throw new Error('Integration not found');

    const kind = integration.kind;

    // send reply to twitter
    if (kind === KIND_CHOICES.TWITTER) {
      // TODO: return tweetReply(conversation, strip(content));
    }

    const messageId = await createMessage(conversation, doc, userId);
    const customer = await Customers.findOne({ _id: conversation.customerId });

    // if conversation's integration kind is form then send reply to
    // customer's email
    const email = customer ? customer.email : '';

    if (kind === KIND_CHOICES.FORM && email) {
      // TODO: sendEmail
    }

    // send reply to facebook
    if (kind === KIND_CHOICES.FACEBOOK) {
      // when facebook kind is feed, assign commentId in extraData
      // TODO: facebookReply(conversation, strip(content), messageId);
    }

    return messageId;
  },

  /**
   * Assign employee to conversation
   * @param  {list} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} String
   */
  async conversationsAssign(root, { conversationIds, assignedUserId }, { user }) {
    if (!user) throw new Error('Login required');

    const { selector } = await conversationsCheckExistance(conversationIds);

    if (!Users.findOne({ _id: assignedUserId })) {
      throw new Error('User not found.');
    }

    await Conversations.assignUserConversation(conversationIds, assignedUserId);

    // notify graphl subscription
    conversationsChanged(conversationIds, 'statusChanged');

    const updatedConversations = await Conversations.find(selector);

    // send notification
    updatedConversations.forEach(conversation => {
      const content = 'Assigned user has changed';
      // TODO: sendNotification
    });

    return 'done';
  },

  /**
   * Unassign employee from conversation
   * @param  {list} ids of conversation
   * @return {Promise} String
   */
  async conversationsUnassign(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await conversationsCheckExistance(_ids);

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

    const { conversations } = await conversationsCheckExistance(_ids);

    Conversations.changeStatusConversation(_ids, status);

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');

    conversations.forEach(conversation => {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        const customer = conversation.customer();
        const integration = conversation.integration();
        const messengerData = integration.messengerData || {};
        const notifyCustomer = messengerData.notifyCustomer || false;

        if (notifyCustomer && customer.email) {
          // send email to customer
          // TODO: send email
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

    // check conversations existance
    await conversationsCheckExistance(_ids);

    await Users.update(
      { _id: user._id },
      {
        $addToSet: {
          'details.starredConversationIds': { $each: _ids },
        },
      },
    );

    return 'done';
  },

  /**
   * Unstar conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsUnstar(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    // check conversations existance
    await conversationsCheckExistance(_ids);

    await Users.update(
      { _id: user._id },
      {
        $pull: {
          'details.starredConversationIds': { $in: _ids },
        },
      },
    );

    return 'done';
  },

  /**
   * Add or remove participed users in conversation
   * @param  {list} _ids of conversation
   * @return {Promise} String
   */
  async conversationsToggleParticipate(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    const { selector } = await conversationsCheckExistance(_ids);

    const extendSelector = {
      ...selector,
      participatedUserIds: { $in: [user._id] },
    };

    // not previously added
    if ((await Conversations.find(extendSelector).count()) === 0) {
      await Conversations.addParticipatedUserToConversation(_ids, user._id);
    } else {
      // remove
      await Conversations.removeParticipatedUserFromConversation(_ids, user._id);
    }

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

    const conversation = await Conversations.findOne({ _id });

    if (!conversation) return 'not affected';

    const readUserIds = conversation.readUserIds;

    // if current user is first one
    if (!readUserIds) {
      return Conversations.markAsReadConversation(_id, user._id);
    }

    // if current user is not in read users list then add it
    if (!readUserIds.includes(user._id)) {
      return Conversations.markAsReadConversation(_id, user._id, false);
    }

    return 'done';
  },
};

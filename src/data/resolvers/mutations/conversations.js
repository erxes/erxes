/*
 * Will implement actual db changes after removing meteor
 */

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
      return ConversationMessages.createMessage({ ...doc, userId });
    }

    const integration = await Integrations.findOne({ _id: conversation.integrationId });

    if (!integration) throw new Error('Integration not found');

    const kind = integration.kind;

    // send reply to twitter
    if (kind === KIND_CHOICES.TWITTER) {
      // TODO: return tweetReply(conversation, strip(content));
    }

    const message = await ConversationMessages.createMessage({ ...doc, userId });
    const messageId = message._id;
    const customer = await Customers.findOne({ _id: conversation.customerId });

    // subscribe
    pubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message,
    });

    pubsub.publish('conversationsChanged', {
      conversationsChanged: { customerId: conversation.customerId, type: 'newMessage' },
    });

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

  /*
   * assign employee to conversation
   */
  async conversationsAssign(root, { conversationIds, assignedUserId }, { user }) {
    if (!user) throw new Error('Login required');

    const { selector } = await conversationsCheckExistance(conversationIds);

    if (!Users.findOne({ _id: assignedUserId })) {
      throw new Error('User not found.');
    }

    await Conversations.update(
      { _id: { $in: conversationIds } },
      { $set: { assignedUserId } },
      { multi: true },
    );

    // notify graphl subscription
    conversationsChanged(conversationIds, 'statusChanged');

    const updatedConversations = await Conversations.find(selector);

    // send notification
    updatedConversations.forEach(function(conversation) {
      const content = 'Assigned user has changed';
      // TODO: sendNotification
    });
  },

  /*
   * unassign employee from conversation
   */
  async conversationsUnassign(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    await conversationsCheckExistance(_ids);

    await Conversations.update(
      { _id: { $in: _ids } },
      { $unset: { assignedUserId: 1 } },
      { multi: true },
    );

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');
  },

  async conversationsChangeStatus(root, { _ids, status }, { user }) {
    if (!user) throw new Error('Login required');

    const { conversations } = await conversationsCheckExistance(_ids);

    Conversations.update({ _id: { $in: _ids } }, { $set: { status } }, { multi: true });

    // notify graphl subscription
    conversationsChanged(_ids, 'statusChanged');

    conversations.forEach(function(conversation) {
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
  },

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
  },

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
  },

  async conversationsToggleParticipate(root, { _ids }, { user }) {
    if (!user) throw new Error('Login required');

    const { selector } = await conversationsCheckExistance(_ids);

    const extendSelector = {
      ...selector,
      participatedUserIds: { $in: [user._id] },
    };

    // not previously added
    if ((await Conversations.find(extendSelector).count()) === 0) {
      await Conversations.update(
        selector,
        { $addToSet: { participatedUserIds: user._id } },
        { multi: true },
      );
    } else {
      // remove
      await Conversations.update(
        selector,
        { $pull: { participatedUserIds: { $in: [user._id] } } },
        { multi: true },
      );
    }

    // notify graphl subscription
    conversationsChanged(_ids, 'participatedStateChanged');
  },

  async conversationMarkAsRead(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    const conversation = await Conversations.findOne({ _id });

    if (conversation) {
      const readUserIds = conversation.readUserIds;

      // if current user is first one
      if (!readUserIds) {
        return Conversations.update({ _id: _id }, { $set: { readUserIds: [user._id] } });
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(user._id)) {
        return Conversations.update({ _id }, { $push: { readUserIds: user._id } });
      }
    }

    return 'not affected';
  },
};

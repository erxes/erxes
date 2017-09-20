/*
 * Will implement actual db changes after removing meteor
 */

import { Conversations, ConversationMessages } from '../../../db/models';
import { pubsub } from '../subscriptions';

export default {
  async conversationMessageInserted(root, { _id }) {
    const message = await ConversationMessages.findOne({ _id });
    const conversationId = message.conversationId;
    const conversation = await Conversations.findOne({ _id: conversationId });

    pubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message,
    });

    pubsub.publish('conversationsChanged', {
      conversationsChanged: { customerId: conversation.customerId, type: 'newMessage' },
    });

    return 'done';
  },

  async conversationsChanged(root, { _ids, type }) {
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
  },

  // will implement actual db changes after removing meteor
  async saveFormWidget(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });
    const conversation = await Conversations.findOne({ _id: message.conversationId });

    pubsub.publish('conversationsChanged', {
      conversationsChanged: { customerId: conversation.customerId, type: 'newMessage' },
    });

    return 'saved';
  },
};

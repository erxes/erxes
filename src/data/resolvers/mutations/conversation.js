import { Conversations, ConversationMessages } from '../../../db/models';
import { pubsub } from '../subscriptions';

export default {
  // will implement actual db changes after removing meteor
  async insertMessage(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });
    const conversationId = message.conversationId;
    const conversation = await Conversations.findOne({ _id: conversationId });

    // notify new message
    pubsub.publish('conversationUpdated', {
      conversationUpdated: { conversationId, type: 'newMessage', message },
    });

    pubsub.publish('conversationNotification', {
      conversationNotification: { customerId: conversation.customerId },
    });

    return message;
  },

  /*
   * resolve or reopen conversation
   */
  changeConversationStatus(root, { _id }) {
    pubsub.publish('conversationUpdated', {
      conversationUpdated: { conversationId: _id, type: 'statusChanged' },
    });

    return _id;
  },

  assignConversations(root, { _ids }) {
    for (let _id of _ids) {
      pubsub.publish('conversationUpdated', {
        conversationUpdated: { conversationId: _id, type: 'assigneeChanged' },
      });
    }

    return [_ids];
  },

  // will implement actual db changes after removing meteor
  async readConversationMessages(root, { _id }) {
    const conversation = await Conversations.findOne({ _id });

    pubsub.publish('conversationUpdated', {
      conversationUpdated: { conversationId: _id, type: 'readStateChanged' },
    });

    pubsub.publish('conversationNotification', {
      conversationNotification: { customerId: conversation.customerId },
    });

    return _id;
  },

  // will implement actual db changes after removing meteor
  async saveFormWidget(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });
    const conversation = await Conversations.findOne({ _id: message.conversationId });

    pubsub.publish('conversationNotification', {
      conversationNotification: { customerId: conversation.customerId },
    });

    return 'saved';
  },
};

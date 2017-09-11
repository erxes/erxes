import { ConversationMessages } from '../../../db/models';
import { pubsub } from '../subscriptions';

export default {
  async insertMessage(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });
    const conversationId = message.conversationId;

    pubsub.publish('conversationUpdated', {
      conversationUpdated: { conversationId, type: 'newMessage', message },
    });

    pubsub.publish('conversationNotification', {
      conversationNotification: 'newMessage',
    });

    return message;
  },

  async widgetConversationMessage(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });
    const conversationId = message.conversationId;

    pubsub.publish('conversationUpdated', {
      conversationUpdated: { conversationId, type: 'newMessage', message },
    });

    return 'notified';
  },

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
};

import { ConversationMessages } from '../../../db/models';
import { pubsub } from '../subscriptions';

export default {
  async insertMessage(root, { messageId }) {
    const message = await ConversationMessages.findOne({ _id: messageId });

    pubsub.publish('conversationMessageAdded', { conversationMessageAdded: message });

    return message;
  },
};

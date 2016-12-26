import { Messages } from './connectors';
import { pubsub } from './subscription-manager';

export default {
  Mutation: {
    simulateInsertMessage(root, args) {
      const message = Messages.findOne({ _id: args.messageId });

      pubsub.publish('messageInserted', message);
      pubsub.publish('notification');

      return message;
    },

    /*
     * mark given conversation's messages as read
     */
    readConversationMessages(root, args) {
      return Messages.update(
        {
          conversationId: args.conversationId,
          userId: { $exists: true },
          isCustomerRead: { $exists: false },
        },
        { isCustomerRead: true },
        { multi: true },

        () => {
          // notify all notification subscribers that message's read
          // state changed
          pubsub.publish('notification');
        }
      );
    },
  },
};

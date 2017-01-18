import _ from 'underscore';
import { Conversations, Messages, Users } from './connectors';

export default {
  RootQuery: {
    conversations(root, args) {
      const { integrationId, customerId } = args;

      return Conversations.find({
        integrationId,
        customerId,
      }).sort({ createdAt: -1 });
    },

    messages(root, { conversationId }) {
      return Messages.find({ conversationId }).sort({ createdAt: 1 });
    },

    unreadCount(root, { conversationId }) {
      return Messages.count({
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    totalUnreadCount(root, args) {
      const { integrationId, customerId } = args;

      // find conversations
      return Conversations.find({
        integrationId,
        customerId,
      })

      .then((conversations) => {
        const conversationIds = _.pluck(conversations, '_id');

        // find read messages count
        return Messages.count({
          conversationId: { $in: conversationIds },
          userId: { $exists: true },
          isCustomerRead: { $exists: false },
        });
      });
    },

    conversationLastStaff(root, args) {
      const messageQuery = {
        conversationId: args._id,
        userId: { $exists: true },
      };

      return Messages.findOne(messageQuery).then((message) =>
        Users.findOne({ _id: message && message.userId })
      );
    },
  },

  Message: {
    user(root) {
      return Users.findOne({ _id: root.userId });
    },
  },
};

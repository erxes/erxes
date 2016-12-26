import { Conversations, Messages, Users } from './connectors';
import { getIntegration, getCustomer } from './utils';

export default {
  RootQuery: {
    conversations(_, { brandCode, email }) {
      let integrationId;

      return getIntegration(brandCode)
        // find customer
        .then((integration) => {
          integrationId = integration._id;

          return getCustomer(integrationId, email);
        })

        // find conversations
        .then(customer =>
          Conversations.find({
            integrationId,
            customerId: customer._id,
          }))

        // catch exception
        .catch((error) => {
          console.log(error); // eslint-disable-line no-console
        });
    },

    messages(_, { conversationId }) {
      return Messages.find({ conversationId });
    },

    unreadCount(_, { conversationId }) {
      return Messages.count({
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    totalUnreadCount() {
      return Messages.count({
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    conversationLastStaff(_, args) {
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

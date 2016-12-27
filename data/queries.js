import _ from 'underscore';
import { Conversations, Messages, Users } from './connectors';
import { getIntegration, getCustomer } from './utils';


const findConversations = ({ brandCode, email }) => {
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
}


export default {
  RootQuery: {
    conversations(root, args) {
      return findConversations(args)
        .catch((error) => {
          console.log(error); // eslint-disable-line no-console
        });
    },

    messages(root, { conversationId }) {
      return Messages.find({ conversationId });
    },

    unreadCount(root, { conversationId }) {
      return Messages.count({
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      });
    },

    totalUnreadCount(root, args) {
      // find conversations
      return findConversations(args).
        // find unread messages count
        then((conversations) => {
          const conversationIds = _.pluck(conversations, '_id');

          return Messages.count({
            conversationId: { $in: conversationIds },
            userId: { $exists: true },
            isCustomerRead: { $exists: false },
          });
        })
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

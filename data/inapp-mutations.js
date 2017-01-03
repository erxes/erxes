import { Messages, Customers } from './connectors';
import { pubsub } from './subscription-manager';
import { getIntegration, getCustomer, getOrCreateConversation } from './utils';
import { createMessage } from './utils';

export default {
  Mutation: {
    simulateInsertMessage(root, args) {
      return Messages.findOne({ _id: args.messageId })
        .then((message) => {
          pubsub.publish('newMessagesChannel', message);
          pubsub.publish('notification');
        });
    },

    /*
     * create or update customer info, when connection establish
     */
    inAppConnect(root, args) {
      let integrationId;

      // find integration
      return getIntegration(args.brandCode)

        // find customer
        .then((integration) => {
          integrationId = integration._id;

          return getCustomer(integration._id, args.email);
        })

        // update or create customer
        .then((customer) => {
          const now = new Date();

          // update customer
          if (customer) {
            // update inAppMessagingData
            Customers.update(
              { _id: customer._id },
              { $set: {
                'inAppMessagingData.lastSeenAt': now,
                'inAppMessagingData.isActive': true,
              } },
              () => {}
            );

            if ((now - customer.inAppMessagingData.lastSeenAt) > 30 * 60 * 1000) {
              // update session count
              Customers.update(
                { _id: customer._id },
                { $inc: { 'inAppMessagingData.sessionCount': 1 } },
                () => {}
              );
            }

            return Customers.findOne({ _id: customer._id });
          }

          // create new customer
          const customerObj = new Customers({
            createdAt: new Date,
            email: args.email,
            name: args.name,
            integrationId,
            inAppMessagingData: { lastSeenAt: now, isActive: true, sessionCount: 1 },
          });

          return customerObj.save();
        })

        // save integrationId, customerIds on connection
        // for later use
        .then((customer) => ({
          integrationId,
          customerId: customer._id,
        }));
    },

    /*
     * create new message
     */
    insertMessage(root, args) {
      const {
        integrationId, customerId, conversationId, message, attachments,
      } = args;

      // get or create conversation
      return getOrCreateConversation({
        conversationId,
        integrationId,
        customerId,
        message,
      })

      // create message
      .then((id) =>
        createMessage({
          conversationId: id,
          customerId,
          message,
          attachments,
        })
      )

      // publish change
      .then((msg) => {
        pubsub.publish('newMessagesChannel', msg);
        pubsub.publish('notification');

        return msg;
      })

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
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

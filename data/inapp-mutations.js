import { Messages, Customers } from './connectors';
import { pubsub } from './subscription-manager';
import { getIntegration, getCustomer, getOrCreateConversation } from './utils';
import { createMessage, createCustomer } from './utils';

export default {
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

    const { brandCode, email, name } = args;

    // find integration
    return getIntegration(brandCode, 'in_app_messaging')

      // find customer
      .then((integration) => {
        integrationId = integration._id;

        return getCustomer(integration._id, email);
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
        return createCustomer({ integrationId, email, name });
      })

      // return integrationId, customerId
      .then((customer) => ({
        integrationId,
        customerId: customer._id,
      }))

      // catch exception
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
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
      { multi: true }
    )

    // notify all notification subscribers that message's read
    // state changed
    .then(() => {
      pubsub.publish('notification');
    });
  },
};

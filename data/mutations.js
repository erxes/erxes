import { Messages, Conversations } from './connectors';
import { pubsub } from './subscription-manager';
import { getIntegration, getCustomer } from './utils';

const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

const getOrCreateConversation = (doc) => {
  const { conversationId, integrationId, customerId, message } = doc;

  // customer can write message to even closed conversation
  if (conversationId) {
    Conversations.update(
      { _id: conversationId },
      {
        // empty read users list then it will be shown as unread again
        readUserIds: [],

        // if conversation is closed then reopen it.
        status: CONVERSATION_STATUSES.OPEN,
      }
    );

    return doc.conversationId;
  }

  // create conversation object
  const conversationObj = new Conversations({
    customerId,
    integrationId,
    content: message,
    status: CONVERSATION_STATUSES.NEW,
    createdAt: new Date(),
    number: Conversations.find().count() + 1,
    messageCount: 0,
  });

  // save conversation
  return conversationObj.save();
};

const createMessage = (doc) => {
  const { conversationId, customerId, message, attachments } = doc;

  const messageOptions = {
    createdAt: new Date,
    conversationId,
    customerId,
    content: message,
    internal: false,
  };

  if (attachments) {
    messageOptions.attachments = attachments;
  }

  // create message object
  const messageObj = new Messages(messageOptions);

  // save and return newly created one
  return messageObj.save().then((_id) => Messages.findOne({ _id }));
};

export default {
  Mutation: {
    simulateInsertMessage(root, args) {
      const message = Messages.findOne({ _id: args.messageId });

      pubsub.publish('messageInserted', message);
      pubsub.publish('notification');

      return message;
    },

    insertMessage(root, args) {
      const { brandCode, email, conversationId, message, attachments } = args;

      let integrationId;
      let customerId;

      return getIntegration(brandCode)
        // find customer
        .then((integration) => {
          integrationId = integration._id;

          return getCustomer(integrationId, email);
        })

        // get or create conversation
        .then(customer => {
          customerId = customer._id;

          return getOrCreateConversation({
            conversationId,
            integrationId,
            customerId: customer._id,
            message,
          });
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
          pubsub.publish('messageInserted', msg);
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

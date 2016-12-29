import { Messages, Conversations } from './connectors';
import { Brands, Customers, Integrations } from './connectors';

const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

export const getIntegration = (brandCode) =>
  Brands.findOne({ code: brandCode })
    .then(brand =>
      // find integration by brand
      Integrations.findOne({
        brandId: brand._id,
        kind: 'in_app_messaging',
      })
    );


export const getCustomer = (integrationId, email) =>
  Customers.findOne({ email, integrationId });


export const getOrCreateConversation = (doc) => {
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

    return Promise.resolve(doc.conversationId);
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


export const createMessage = (doc) => {
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


// mark as not active when connection close
export const markCustomerAsNotActive = (customerId) => {
  Customers.update(
    { _id: customerId },
    {
      $set: {
        'inAppMessagingData.isActive': false,
        'inAppMessagingData.lastSeenAt': new Date(),
      },
    },

    () => {}
  );
};

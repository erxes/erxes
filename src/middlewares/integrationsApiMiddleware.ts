import { ConversationMessages, Conversations, Customers } from '../db/models';
import { graphqlPubsub } from '../pubsub';

/*
 * Handle requests from integrations api
 */
const integrationsApiMiddleware = async (req, res) => {
  const { action, payload } = req.body;
  const doc = JSON.parse(payload);

  if (action === 'create-customer') {
    const customer = await Customers.createCustomer(doc);

    return res.json({ _id: customer._id });
  }

  if (action === 'create-conversation') {
    const conversation = await Conversations.createConversation(doc);

    return res.json({ _id: conversation._id });
  }

  if (action === 'create-conversation-message') {
    const message = await ConversationMessages.createMessage(doc);

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message,
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message,
    });

    return res.json({ _id: message._id });
  }
};

export default integrationsApiMiddleware;

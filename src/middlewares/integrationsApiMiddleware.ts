import { ActivityLogs, ConversationMessages, Conversations, Customers, Integrations } from '../db/models';
import { CONVERSATION_STATUSES } from '../db/models/definitions/constants';
import { graphqlPubsub } from '../pubsub';

interface IMessage {
  status: string;
  attachments: string[];
  readUserIds: string[];
  content?: string;
}

/*
 * Handle requests from integrations api
 */
const integrationsApiMiddleware = async (req, res) => {
  const { action, metaInfo, payload } = req.body;
  const doc = JSON.parse(payload);

  if (action === 'create-or-update-customer') {
    const integration = await Integrations.findOne({ _id: doc.integrationId });

    if (!integration) {
      throw new Error(`Integration not found: ${doc.integrationId}`);
    }

    const { primaryPhone } = doc;

    let customer;

    if (primaryPhone) {
      customer = await Customers.findOne({ primaryPhone }).lean();
    }

    if (customer) {
      await Customers.updateCustomer(customer._id, doc);
    } else {
      customer = await Customers.createCustomer({
        ...doc,
        scopeBrandIds: integration.brandId,
      });
    }

    return res.json({ _id: customer._id });
  }

  if (action === 'create-conversation') {
    const conversation = await Conversations.createConversation(doc);

    await ActivityLogs.createConversationLog(conversation);

    return res.json({ _id: conversation._id });
  }

  if (action === 'create-conversation-message') {
    const message = await ConversationMessages.createMessage(doc);

    const messageDoc: IMessage = {
      // Reopen its conversation if it's closed
      status: CONVERSATION_STATUSES.OPEN,

      attachments: message.attachments,

      // Mark as unread
      readUserIds: [],
    };

    if (message.content && metaInfo === 'replaceContent') {
      messageDoc.content = message.content;
    }

    await Conversations.updateOne({ _id: message.conversationId }, { $set: messageDoc });

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

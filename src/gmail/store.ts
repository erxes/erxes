import { fetchMainApi } from '../utils';
import { ConversationMessages, Conversations, Customers } from './models';
import { extractEmailFromString } from './util';

const createOrGetCustomer = async (email: string, integrationId: string) => {
  let customer = await Customers.findOne({ email });

  if (!customer) {
    try {
      customer = await Customers.create({
        email,
        firstName: '',
        lastName: '',
        integrationId,
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? `Concurrent request: customer duplication` : e);
    }

    try {
      const apiCustomerResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-customer',
          payload: JSON.stringify({
            emails: [email],
            firstName: '',
            lastName: '',
            primaryEmail: email,
            integrationId,
          }),
        },
      });

      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }

  return customer;
};

const createOrGetConversation = async (
  email: string,
  reply: string[],
  integrationId: string,
  customerId: string,
  subject: string,
  receivedEmail: string,
) => {
  let conversation;

  if (reply) {
    const dumpMessage = await ConversationMessages.findOne({
      $or: [{ headerId: { $in: reply } }, { headerId: { $eq: reply } }],
    }).sort({ createdAt: -1 });

    if (dumpMessage) {
      conversation = await Conversations.findOne({
        _id: dumpMessage.conversationId,
      });
    }
  }

  if (!conversation) {
    try {
      conversation = await Conversations.create({
        to: receivedEmail,
        from: email,
        integrationId,
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? 'Concurrent request: conversation duplication' : e);
    }

    // save on api
    try {
      const apiConversationResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation',
          payload: JSON.stringify({
            customerId,
            integrationId,
            content: subject,
          }),
        },
      });

      conversation.erxesApiId = apiConversationResponse._id;
      await conversation.save();
    } catch (e) {
      await Conversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }
  }

  return conversation;
};

const createOrGetConversationMessage = async (
  messageId: string,
  conversationErxesApiId: string,
  customerErxesApiId: string,
  conversationId: string,
  data: any,
) => {
  const conversationMessage = await ConversationMessages.findOne({ messageId });

  if (!conversationMessage) {
    data.from = extractEmailFromString(data.from);
    data.to = extractEmailFromString(data.to);

    const newConversationMessage = await ConversationMessages.create({
      conversationId,
      customerId: customerErxesApiId,
      ...data,
    });

    try {
      const apiMessageResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation-message',
          metaInfo: 'replaceContent',
          payload: JSON.stringify({
            conversationId: conversationErxesApiId,
            customerId: customerErxesApiId,
            content: data.subject,
          }),
        },
      });

      newConversationMessage.erxesApiMessageId = apiMessageResponse._id;
      newConversationMessage.save();
    } catch (e) {
      await ConversationMessages.deleteOne({ messageId });
      throw new Error(e);
    }
  }
};

export { createOrGetConversation, createOrGetConversationMessage, createOrGetCustomer };

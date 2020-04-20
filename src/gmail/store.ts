import { sendRPCMessage } from '../messageBroker';
import { cleanHtml } from '../utils';
import { ConversationMessages, Conversations, Customers } from './models';
import { buildEmail } from './util';

interface IIntegrationIds {
  id: string;
  erxesApiId: string;
}

export const createOrGetCustomer = async (email: string, integrationIds: IIntegrationIds) => {
  const { erxesApiId, id } = integrationIds;

  let customer = await Customers.findOne({ email });

  if (!customer) {
    try {
      customer = await Customers.create({
        email,
        firstName: '',
        lastName: '',
        integrationId: id,
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? `Concurrent request: customer duplication` : e);
    }

    try {
      const apiCustomerResponse = await sendRPCMessage({
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          emails: [email],
          firstName: '',
          lastName: '',
          primaryEmail: email,
          integrationId: erxesApiId,
        }),
      });

      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await Customers.deleteOne({ _id: customer._id });
      throw e;
    }
  }

  return customer;
};

export const createOrGetConversation = async (args: {
  email: string;
  subject: string;
  receivedEmail: string;
  integrationIds: IIntegrationIds;
  customerErxesApiId: string;
  reply?: string[];
}) => {
  const { subject, reply, email, integrationIds, receivedEmail, customerErxesApiId } = args;
  const { id, erxesApiId } = integrationIds;

  let conversation;

  if (reply) {
    const headerIds = Array.isArray(reply) ? reply : [reply];

    const message = await ConversationMessages.findOne({ headerId: { $in: headerIds } });

    if (message) {
      conversation = await Conversations.findOne({
        _id: message.conversationId,
      });
    }
  }

  if (conversation == null || !conversation) {
    try {
      conversation = await Conversations.create({
        to: receivedEmail,
        from: email,
        integrationId: id,
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? 'Concurrent request: conversation duplication' : e);
    }

    // save on api
    try {
      const apiConversationResponse = await sendRPCMessage({
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customerErxesApiId,
          integrationId: erxesApiId,
          content: subject,
        }),
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

export const createOrGetConversationMessage = async (args: {
  messageId: string;
  message: any;
  customerErxesApiId: string;
  conversationIds: {
    id: string;
    erxesApiId: string;
  };
}) => {
  const { messageId, message, customerErxesApiId, conversationIds } = args;
  const { id, erxesApiId } = conversationIds;

  const conversationMessage = await ConversationMessages.findOne({ messageId });

  const doc = {
    conversationId: id,
    messageId,
    threadId: message.threadId,
    headerId: message.headerId,
    labelIds: message.labelIds,
    reference: message.reference,
    to: buildEmail(message.to),
    from: buildEmail(message.from),
    cc: buildEmail(message.cc),
    bcc: buildEmail(message.bcc),
    subject: message.subject,
    body: message.textHtml,
    reply: message.reply,
    attachments: message.attachments,
    customerId: customerErxesApiId,
  };

  if (!conversationMessage) {
    const newConversationMessage = await ConversationMessages.create(doc);

    try {
      const apiMessageResponse = await sendRPCMessage({
        action: 'create-conversation-message',
        metaInfo: 'replaceContent',
        payload: JSON.stringify({
          conversationId: erxesApiId,
          customerId: customerErxesApiId,
          content: cleanHtml(doc.body),
        }),
      });

      newConversationMessage.erxesApiMessageId = apiMessageResponse._id;
      newConversationMessage.save();
    } catch (e) {
      await ConversationMessages.deleteOne({ messageId });
      throw new Error(e);
    }
  }
};

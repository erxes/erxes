import { debugGmail } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models';
import { cleanHtml } from '../utils';
import { ConversationMessages, Conversations, Customers } from './models';
import { IAttachmentParams } from './types';
import { getEmailsAsObject } from './utils';

interface IIntegrationIds {
  id: string;
  erxesApiId: string;
}

interface IEmail {
  subject?: string;
  from?: string;
  fromEmail?: string;
  threadId?: string;
  unread?: boolean;
  headerId?: string;
  sender: string;
  to?: string;
  cc?: string;
  bcc?: string;
  date?: string;
  html?: string;
  references?: string;
  replyTo?: string;
  inReplyTo?: string;
  messageId?: string;
  attachments?: IAttachmentParams;
}

export const updateLastChangesHistoryId = async (email: string, historyId: string) => {
  debugGmail(`Executing: updateLastChangesHistoryId email: ${email}`);

  const integration = await Integrations.findOne({ email });

  if (!integration) {
    throw new Error(`Integration not found with email: ${email}`);
  }

  integration.gmailHistoryId = historyId;

  return integration.save();
};

export const storeCustomer = async ({ email, integrationIds }: { email: IEmail; integrationIds: IIntegrationIds }) => {
  debugGmail('Creating customer');

  const { sender, fromEmail } = email;

  const prevCustomer = await Customers.findOne({ email: fromEmail });

  if (prevCustomer) {
    return {
      customerErxesApiId: prevCustomer.erxesApiId,
      integrationIds,
      email,
    };
  }

  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        emails: [fromEmail],
        firstName: sender,
        lastName: '',
        primaryEmail: fromEmail,
        integrationId: integrationIds.erxesApiId,
      }),
    });

    const customer = await Customers.create({
      email: fromEmail,
      firstName: sender,
      lastName: '',
      integrationId: integrationIds.id,
      erxesApiId: apiCustomerResponse._id,
    });

    return {
      customerErxesApiId: customer.erxesApiId,
      integrationIds,
      email,
    };
  } catch (e) {
    debugGmail('Failed to create customer');
    throw e;
  }
};

export const storeConversation = async (args: {
  email: IEmail;
  customerErxesApiId: string;
  integrationIds: IIntegrationIds;
}) => {
  debugGmail('Creating conversation');

  const { email, integrationIds, customerErxesApiId } = args;
  const { id, erxesApiId } = integrationIds;
  const { to, subject, inReplyTo, from } = email;

  let conversation;

  if (inReplyTo) {
    const headerIds = Array.isArray(inReplyTo) ? inReplyTo : [inReplyTo];

    const message = await ConversationMessages.findOne({ headerId: { $in: headerIds } });

    if (message) {
      conversation = await Conversations.findOne({ _id: message.conversationId });
    }
  }

  if (conversation) {
    return {
      email,
      customerErxesApiId,
      conversationIds: {
        id: conversation._id,
        erxesApiId: conversation.erxesApiId,
      },
    };
  }

  try {
    const apiConversationResponse = await sendRPCMessage({
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customerErxesApiId,
        integrationId: erxesApiId,
        content: subject,
      }),
    });

    conversation = await Conversations.create({
      erxesApiId: apiConversationResponse._id,
      to,
      from,
      integrationId: id,
    });

    return {
      email,
      customerErxesApiId,
      conversationIds: {
        id: conversation._id,
        erxesApiId: conversation.erxesApiId,
      },
    };
  } catch (e) {
    debugGmail(`Failed to create conversation ${e.message}`);
    throw e;
  }
};

export const storeConversationMessage = async (args: {
  email: IEmail;
  customerErxesApiId: string;
  conversationIds: {
    id: string;
    erxesApiId: string;
  };
}) => {
  debugGmail('Creating conversation message');

  const { email, customerErxesApiId, conversationIds } = args;
  const { messageId } = email;
  const { id, erxesApiId } = conversationIds;

  const prevConversationMessage = await ConversationMessages.findOne({ messageId });

  if (prevConversationMessage) {
    return debugGmail(`Message with id: ${messageId} already exists`);
  }

  let apiMessageResponse;

  try {
    apiMessageResponse = await sendRPCMessage({
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        conversationId: erxesApiId,
        customerId: customerErxesApiId,
        content: cleanHtml(email.html),
      }),
    });

    return ConversationMessages.create({
      conversationId: id,
      messageId,
      headerId: email.headerId,
      subject: email.subject,
      body: email.html,
      references: email.references,
      threadId: email.threadId,
      customerId: customerErxesApiId,
      replyTo: email.replyTo,
      unread: email.unread,
      inReplyTo: email.inReplyTo,
      erxesApiMessageId: apiMessageResponse._id,
      to: getEmailsAsObject(email.to),
      cc: getEmailsAsObject(email.cc),
      bcc: getEmailsAsObject(email.bcc),
      from: getEmailsAsObject(email.from),
      sender: email.sender,
      attachments: email.attachments,
    });
  } catch (e) {
    await Conversations.deleteOne({ _id: conversationIds.id });
    await ConversationMessages.deleteOne({ messageId });
    throw e;
  }
};

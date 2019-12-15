import { ConversationMessages, Conversations, Customers } from './facebook/models';
import { Accounts } from './models';
import Integrations from './models/Integrations';
import { NylasGmailConversationMessages, NylasGmailConversations, NylasGmailCustomers } from './nylas/models';

export const accountFactory = (params: {
  kind?: string;
  email?: string;
  scope?: string;
  expireDate?: string;
  token?: string;
  tokenSecret?: string;
  password?: string;
  imapHost?: string;
  smtpHost?: string;
  imapPort?: number;
  smtpPort?: number;
  uid?: string;
  nylasToken?: string;
}) => {
  const account = new Accounts({
    kind: params.kind || '',
    email: params.email || '',
    token: params.token || '',
    scope: params.scope || '',
    expireDate: params.expireDate || '',
    tokenSecret: params.tokenSecret || '',
    nylasToken: params.nylasToken || '',
    password: params.password || '',
    imapHost: params.imapHost || '',
    smtpHost: params.smtpHost || '',
    imapPort: params.imapPort || 0,
    smtpPort: params.smtpPort || 0,
    uid: params.uid || '',
  });

  return account.save();
};

export const integrationFactory = (params: {
  kind?: string;
  accountId?: string;
  erxesApiId?: string;
  email?: string;
  facebookPageIds?: string[];
}) => {
  const integration = new Integrations({
    kind: params.kind || 'facebook',
    accountId: params.accountId || '_id',
    email: params.email || 'user@mail.com',
    erxesApiId: params.erxesApiId || '_id',
    facebookPageIds: params.facebookPageIds || [],
  });

  return integration.save();
};

export const facebookCustomerFactory = (params: { userId: string }) => {
  const customer = new Customers({
    userId: params.userId,
  });

  return customer.save();
};

export const facebookConversationFactory = (params: { senderId: string; recipientId: string }) => {
  const conversation = new Conversations({
    timestamp: new Date(),
    senderId: params.senderId,
    recipientId: params.recipientId,
    content: 'content',
  });

  return conversation.save();
};

export const facebookConversationMessagFactory = (params: { conversationId?: string }) => {
  const message = new ConversationMessages({ conversationId: params.conversationId || '' });

  return message.save();
};

// Nylas gmail customer ===================
export const nylasGmailCustomerFactory = (params: { email?: string; integrationId?: string }) => {
  const customer = new NylasGmailCustomers({
    email: params.email || '',
    kind: 'gmail',
    firstName: 'firstName',
    lastName: 'lastName',
    erxesApiId: 'jalksdjkal',
    integrationId: params.integrationId || '',
  });

  return customer.save();
};

// Nylas gmail conversation =============
export const nylasGmailConversationFactory = (params: { customerId?: string; integrationId?: string }) => {
  const conversation = new NylasGmailConversations({
    to: 'to',
    from: 'from',
    threadId: 'threadId',
    content: 'content',
    erxesApiId: 'klajsdklasj',
    customerId: params.customerId || '',
    integrationId: params.integrationId || '',
  });

  return conversation.save();
};

// Nylaws gmail conversationMessage
export const nylasGmailConversationMessageFactory = (params: { conversationId?: string; messageId?: string }) => {
  const message = new NylasGmailConversationMessages({
    conversationId: params.conversationId || '',
    messageId: params.messageId || '',
  });

  return message.save();
};

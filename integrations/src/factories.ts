import {
  Comments,
  ConversationMessages,
  Conversations,
  Customers,
  Posts
} from './facebook/models';
import { Accounts } from './models';
import Configs from './models/Configs';
import Integrations from './models/Integrations';
import {
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers
} from './nylas/models';

export const configFactory = (params: { code?: string; value?: string }) => {
  const config = new Configs({
    code: params.code || '',
    value: params.value || ''
  });

  return config.save();
};

export const accountFactory = (params: {
  kind?: string;
  name?: string;
  email?: string;
  host?: string;
  username?: string;
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
  nylasAccountId?: string;
  nylasBillingState?: string;
}) => {
  const account = new Accounts({
    kind: params.kind || '',
    name: params.name || '',
    email: params.email || '',
    token: params.token || '',
    scope: params.scope || '',
    host: params.host || '',
    username: params.username || '',
    expireDate: params.expireDate || '',
    tokenSecret: params.tokenSecret || '',
    nylasToken: params.nylasToken || '',
    password: params.password || '',
    imapHost: params.imapHost || '',
    smtpHost: params.smtpHost || '',
    imapPort: params.imapPort || 0,
    smtpPort: params.smtpPort || 0,
    uid: params.uid || '',
    nylasAccountId: params.nylasAccountId || '',
    nylasBillingState: params.nylasBillingState || ''
  });

  return account.save();
};

export const integrationFactory = (params: {
  kind?: string;
  googleAccessToken?: string;
  accountId?: string;
  erxesApiId?: string;
  email?: string;
  gmailHistoryId?: string;
  nylasAccountId?: string;
  nylasToken?: string;
  facebookPageIds?: string[];
  facebookPageTokensMap?: object;
  smoochIntegrationId?: string;
  whatsappinstanceId?: string;
  telegramBotToken?: string;
  whatsappToken?: string;
}) => {
  const integration = new Integrations({
    kind: params.kind || 'facebook',
    accountId: params.accountId || '_id',
    googleAccessToken: params.googleAccessToken || '',
    email: params.email || 'user@mail.com',
    erxesApiId: params.erxesApiId || '_id',
    gmailHistoryId: params.gmailHistoryId || '',
    nylasAccountId: params.nylasAccountId || '',
    nylasToken: params.nylasToken || '',
    facebookPageIds: params.facebookPageIds || [],
    facebookPageTokensMap: params.facebookPageTokensMap || {},
    smoochIntegrationId: params.smoochIntegrationId || 'aaksjfhakjsfhkalhf',
    whatsappinstanceId: params.whatsappinstanceId || '123456',
    whatsappToken: params.whatsappToken || 'asdag123',
    telegramBotToken: params.telegramBotToken || 'asfasfk;alskf'
  });

  return integration.save();
};

export const facebookCustomerFactory = (params: { userId: string }) => {
  const customer = new Customers({
    userId: params.userId
  });

  return customer.save();
};

export const facebookConversationFactory = (params: {
  senderId: string;
  recipientId: string;
}) => {
  const conversation = new Conversations({
    timestamp: new Date(),
    senderId: params.senderId,
    recipientId: params.recipientId,
    content: 'content'
  });

  return conversation.save();
};

export const facebookConversationMessagFactory = (params: {
  conversationId?: string;
  mid?: string;
}) => {
  const message = new ConversationMessages({
    conversationId: params.conversationId || '',
    mid: params.mid || ''
  });

  return message.save();
};

export const facebookPostFactory = (params: { postId?: string }) => {
  const post = new Posts({ postId: params.postId || '' });

  return post.save();
};

export const facebookCommentFactory = (params: { postId?: string }) => {
  const comment = new Comments({ postId: params.postId || '' });

  return comment.save();
};

// Nylas gmail customer ===================
export const nylasGmailCustomerFactory = (params: {
  email?: string;
  integrationId?: string;
}) => {
  const customer = new NylasGmailCustomers({
    email: params.email || '',
    kind: 'gmail',
    firstName: 'firstName',
    lastName: 'lastName',
    erxesApiId: 'jalksdjkal',
    integrationId: params.integrationId || ''
  });

  return customer.save();
};

// Nylas gmail conversation =============
export const nylasGmailConversationFactory = (params: {
  customerId?: string;
  integrationId?: string;
}) => {
  const conversation = new NylasGmailConversations({
    to: 'to',
    from: 'from',
    threadId: 'threadId',
    content: 'content',
    erxesApiId: 'klajsdklasj',
    customerId: params.customerId || '',
    integrationId: params.integrationId || ''
  });

  return conversation.save();
};

// Nylaws gmail conversationMessage
export const nylasGmailConversationMessageFactory = (params: {
  conversationId?: string;
  messageId?: string;
}) => {
  const message = new NylasGmailConversationMessages({
    conversationId: params.conversationId || '',
    messageId: params.messageId || ''
  });

  return message.save();
};

import { debugNylas } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { Accounts } from '../models';
import { cleanHtml } from '../utils';
import { checkConcurrentError } from '../utils';
import {
  NylasExchangeConversationMessages,
  NylasExchangeConversations,
  NylasExchangeCustomers,
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers,
  NylasImapConversationMessages,
  NylasImapConversations,
  NylasImapCustomers,
  NylasOffice365ConversationMessages,
  NylasOffice365Conversations,
  NylasOffice365Customers,
  NylasOutlookConversationMessages,
  NylasOutlookConversations,
  NylasOutlookCustomers,
  NylasYahooConversationMessages,
  NylasYahooConversations,
  NylasYahooCustomers,
} from './models';
import {
  IAPIConversation,
  IAPIConversationMessage,
  IAPICustomer,
  IGetOrCreateArguments,
  INylasConversationArguments,
  INylasConversationMessageArguments,
  INylasCustomerArguments,
} from './types';

const NYLAS_MODELS = {
  gmail: {
    customers: NylasGmailCustomers,
    conversations: NylasGmailConversations,
    conversationMessages: NylasGmailConversationMessages,
  },
  exchange: {
    customers: NylasExchangeCustomers,
    conversations: NylasExchangeConversations,
    conversationMessages: NylasExchangeConversationMessages,
  },
  imap: {
    customers: NylasImapCustomers,
    conversations: NylasImapConversations,
    conversationMessages: NylasImapConversationMessages,
  },
  outlook: {
    customers: NylasOutlookCustomers,
    conversations: NylasOutlookConversations,
    conversationMessages: NylasOutlookConversationMessages,
  },
  yahoo: {
    customers: NylasYahooCustomers,
    conversations: NylasYahooConversations,
    conversationMessages: NylasYahooConversationMessages,
  },
  office365: {
    customers: NylasOffice365Customers,
    conversations: NylasOffice365Conversations,
    conversationMessages: NylasOffice365ConversationMessages,
  },
};

/**
 * Connect account and add nylas token
 * @param {String} _id
 * @param {String} accountId
 * @param {String} access_token
 */
const updateAccount = async (_id: string, accountId: string, accessToken: string, billingState: string) => {
  const selector = { _id };
  const updateFields = { $set: { uid: accountId, nylasToken: accessToken, billingState } };

  try {
    await Accounts.updateOne(selector, updateFields);
  } catch (e) {
    throw new Error(e.mesasge);
  }
};

/**
 * Create or get nylas customer
 * @param {String} kind
 * @param {String} toEmail
 * @param {Object} from - email, name
 * @param {Object} integrationIds - id, erxesApiId
 * @param {Object} message
 * @returns {Promise} customer object
 */
const createOrGetNylasCustomer = async ({ kind, toEmail, integrationIds, message }: INylasCustomerArguments) => {
  const { id, erxesApiId } = integrationIds;
  const [{ email, name }] = message.from;

  debugNylas('Create or get nylas customer function called...');

  const common = { kind, firstName: name, lastName: '' };

  const doc = {
    email,
    integrationId: id,
    ...common,
  };

  // fields to save on api
  const api = {
    emails: [email],
    primaryEmail: email,
    integrationId: erxesApiId,
    ...common,
  };

  let customer;

  try {
    customer = await getOrCreate({
      kind,
      collectionName: 'customers',
      selector: { email },
      fields: { doc, api },
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate customer: ${e.message}`);
    throw new Error(e);
  }

  return {
    kind,
    message,
    integrationIds,
    customerId: customer.erxesApiId,
    emails: {
      fromEmail: email,
      toEmail,
    },
  };
};

/**
 * Create or get nylas conversation
 * @param {String} kind
 * @param {String} toEmail
 * @param {String} threadId
 * @param {String} subject
 * @param {Object} emails - toEmail, fromEamil
 * @param {Object} integrationIds - id, erxesApiId
 * @returns {Promise} conversation object
 */
const createOrGetNylasConversation = async ({
  kind,
  customerId,
  integrationIds,
  emails,
  message,
}: INylasConversationArguments) => {
  const { toEmail, fromEmail } = emails;
  const { id, erxesApiId } = integrationIds;

  debugNylas(`Creating nylas conversation kind: ${kind}`);

  const createdAt = message.date * 1000; // get milliseconds

  const doc = {
    to: toEmail,
    from: fromEmail,
    integrationId: id,
    threadId: message.thread_id,
    unread: message.unread,
    createdAt,
  };

  // fields to save on api
  const api = {
    customerId,
    content: message.subject,
    integrationId: erxesApiId,
    unread: message.unread,
    createdAt,
  };

  let conversation;

  try {
    conversation = await getOrCreate({
      kind,
      collectionName: 'conversations',
      fields: { doc, api },
      selector: { threadId: message.thread_id },
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate conversation: ${e.message}`);
    throw new Error(e);
  }

  return {
    kind,
    message,
    customerId,
    conversationIds: {
      id: conversation._id,
      erxesApiId: conversation.erxesApiId,
    },
  };
};

/**
 * Create or get nylas conversation message
 * @param {String} kind
 * @param {Object} conversationIds - id, erxesApiId
 * @param {Object} message
 * @param {String} customerId
 * @returns {Promise} - conversationMessage object
 */
const createOrGetNylasConversationMessage = async ({
  kind,
  conversationIds,
  message,
  customerId,
}: INylasConversationMessageArguments) => {
  const { id, erxesApiId } = conversationIds;

  debugNylas(`Creating nylas conversation message kind: ${kind}`);

  const createdAt = message.date * 1000; // get milliseconds

  const doc = {
    customerId,
    conversationId: id,

    // message
    messageId: message.id,
    accountId: message.account_id,
    threadId: message.thread_id,
    subject: message.subject,
    from: message.from,
    to: message.to,
    replyTo: message.replyTo,
    cc: message.cc,
    bcc: message.bcc,
    date: message.date,
    snipped: message.snippet,
    body: message.body,
    attachments: message.files,
    labels: message.labels,
    unread: message.unread,
    createdAt,
  };

  // fields to save on api
  const api = {
    customerId,
    conversationId: erxesApiId,
    content: cleanHtml(message.body),
    unread: message.unread,
    createdAt,
  };

  let conversationMessage;

  try {
    conversationMessage = await getOrCreate({
      kind,
      collectionName: 'conversationMessages',
      selector: { messageId: message.id },
      fields: { doc, api },
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate conversationMessage: ${e.message}`);
    throw new Error(e);
  }

  return conversationMessage;
};

/**
 * Get or create selected model
 * @param {Model} model - Customer, Conversation, ConversationMessage
 * @param {Object} args - doc, selector, apiField, name
 * @param {Promise} selected model
 */
const getOrCreate = async ({ kind, collectionName, selector, fields }: IGetOrCreateArguments) => {
  const map = {
    customers: {
      action: 'get-create-update-customer',
      apiField: 'erxesApiId',
    },
    conversations: {
      action: 'create-or-update-conversation',
      apiField: 'erxesApiId',
    },
    conversationMessages: {
      action: 'create-conversation-message',
      apiField: 'erxesApiMessageId',
    },
  };

  const model = NYLAS_MODELS[kind][collectionName];

  let selectedObj = await model.findOne(selector);

  if (!selectedObj) {
    try {
      selectedObj = await model.create(fields.doc);
    } catch (e) {
      checkConcurrentError(e, collectionName);
    }

    try {
      const response = await requestMainApi(map[collectionName].action, fields.api);

      selectedObj[map[collectionName].apiField] = response._id;

      await selectedObj.save();
    } catch (e) {
      await model.deleteOne({ _id: selectedObj._id });
      throw new Error(e);
    }
  }

  return selectedObj;
};

/**
 * Send post request to Main API to store
 * @param {String} action
 * @returns {Promise} main api response
 */
const requestMainApi = (action: string, params: IAPICustomer | IAPIConversation | IAPIConversationMessage) => {
  return sendRPCMessage({
    action,
    metaInfo: action.includes('message') ? 'replaceContent' : null,
    payload: JSON.stringify(params),
  });
};

export {
  createOrGetNylasCustomer,
  createOrGetNylasConversation,
  createOrGetNylasConversationMessage,
  NYLAS_MODELS,
  updateAccount,
  requestMainApi,
};

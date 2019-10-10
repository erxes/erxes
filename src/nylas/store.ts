import { debugNylas } from '../debuggers';
import { fetchMainApi } from '../utils';
import { checkConcurrentError } from '../utils';
import { ACTIONS } from './constants';
import {
  IAPIConversation,
  IAPIConversationMessage,
  IAPICustomer,
  IGetOrCreateArguments,
  INylasConversationArguments,
  INylasConversationMessageArguments,
  INylasCustomerArguments,
} from './types';
import { getNylasModel } from './utils';

/**
 * Create or get nylas customer
 * @param {String} kind
 * @param {String} toEmail
 * @param {Object} from - email, name
 * @param {Object} integrationIds - id, erxesApiId
 * @param {Object} message
 * @returns {Promise} customer object
 */
const createOrGetNylasCustomer = async (args: INylasCustomerArguments) => {
  const { kind, toEmail, integrationIds, message } = args;
  const { id, erxesApiId } = integrationIds;
  const [{ email, name }] = message.from;

  debugNylas('Create or get nylas customer function called...');

  const { Customers } = getNylasModel(kind);

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

  const params = {
    name: 'customer',
    apiField: 'erxesApiId',
    selector: { email },
    fields: { doc, api },
  };

  const customer = await getOrCreate(Customers, params);

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
const createOrGetNylasConversation = async (args: INylasConversationArguments) => {
  const { kind, customerId, integrationIds, emails, message } = args;
  const { toEmail, fromEmail } = emails;
  const { id, erxesApiId } = integrationIds;
  const { Conversations } = getNylasModel(kind);

  debugNylas(`Creating nylas conversation kind: ${kind}`);

  const doc = {
    to: toEmail,
    from: fromEmail,
    integrationId: id,
    threadId: message.thread_id,
  };

  // fields to save on api
  const api = {
    customerId,
    content: message.subject,
    integrationId: erxesApiId,
  };

  const params = {
    name: 'conversation',
    apiField: 'erxesApiId',
    fields: { doc, api },
    selector: { threadId: message.thread_id },
  };

  const conversation = await getOrCreate(Conversations, params);

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
const createOrGetNylasConversationMessage = async (args: INylasConversationMessageArguments) => {
  const { kind, conversationIds, message, customerId } = args;
  const { id, erxesApiId } = conversationIds;

  debugNylas(`Creating nylas conversation message kind: ${kind}`);

  const { ConversationMessages } = getNylasModel(kind);

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
  };

  // fields to save on api
  const api = {
    customerId,
    content: message.subject,
    conversationId: erxesApiId,
  };

  const params = {
    name: 'conversationMessage',
    selector: { messageId: message.id },
    apiField: 'erxesApiMessageId',
    fields: { doc, api },
    metaInfo: 'replaceContent',
  };

  const conversationMessage = await getOrCreate(ConversationMessages, params);

  return conversationMessage;
};

/**
 * Get or create selected model
 * @param {Model} model - Customer, Conversation, ConversationMessage
 * @param {Object} args - doc, selector, apiField, name
 * @param {Promise} selected model
 */
const getOrCreate = async (model, args: IGetOrCreateArguments) => {
  const { selector, fields, apiField, name, metaInfo } = args;

  let selectedModel = await model.findOne(selector);

  if (!selectedModel) {
    try {
      selectedModel = await model.create(fields.doc);
    } catch (e) {
      checkConcurrentError(e, name);
    }

    try {
      const response = await requestMainApi(ACTIONS[name], fields.api, metaInfo);

      selectedModel[apiField] = response._id;

      await selectedModel.save();
    } catch (e) {
      await model.deleteOne({ _id: selectedModel._id });
      throw new Error(e);
    }
  }

  return selectedModel;
};

/**
 * Send post request to Main API to store
 * @param {String} action
 * @returns {Promise} main api response
 */
const requestMainApi = (
  action: string,
  params: IAPICustomer | IAPIConversation | IAPIConversationMessage,
  metaInfo?: string,
) => {
  return fetchMainApi({
    path: '/integrations-api',
    method: 'POST',
    body: {
      action,
      metaInfo,
      payload: JSON.stringify(params),
    },
  });
};

export { createOrGetNylasCustomer, createOrGetNylasConversation, createOrGetNylasConversationMessage };

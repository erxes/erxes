import * as fs from 'fs';
import { debugNylas } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { compose, sendRequest } from '../utils';
import { GOOGLE_OAUTH_TOKEN_VALIDATION_URL, MICROSOFT_GRAPH_URL } from './constants';
import {
  createOrGetNylasConversation as storeConversation,
  createOrGetNylasConversationMessage as storeMessage,
  createOrGetNylasCustomer as storeCustomer,
} from './store';
import { IFilter, IMessageDraft, INylasAttachment } from './types';
import { nylasRequest, nylasSendMessage, setNylasToken } from './utils';

/**
 * Build message and send API request
 * @param {String} - child function name
 * @param {String} - accessToken
 * @param {String} - filter
 * @param {Promise} - nylas message object
 */
const buildMessage = (child: string, ...args: Array<string | IFilter>) => {
  const [accessToken, filter] = args;

  return nylasRequest({
    parent: 'messages',
    child,
    accessToken,
    filter,
  });
};

/**
 * Get messages
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas list of messagas
 */
const getMessages = (...args: string[]) => buildMessage('list', ...args);

/**
 * Get message by filtered args
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas message object
 */
const getMessageById = (...args: string[]) => buildMessage('find', ...args);

/**
 * Send or Reply message
 * @param {String} accessToken
 * @param {Object} args - message object
 * @returns {Promise} message object response
 */
const sendMessage = (accessToken: string, args: IMessageDraft) => nylasSendMessage(accessToken, args);

/**
 * Google: get email from google with accessToken
 * @param {String} accessToken
 * @returns {Promise} email
 */
const getUserEmailFromGoogle = async (accessToken: string): Promise<string> => {
  const data = { access_token: accessToken, fields: ['email'] };

  const { email } = await sendRequest({
    url: GOOGLE_OAUTH_TOKEN_VALIDATION_URL,
    method: 'post',
    body: data,
  });

  return email;
};

/**
 * Office 365: get email from google with accessToken
 * @param {String} accessToken
 * @returns {Promise} email
 */
const getUserEmailFromO365 = async (accessToken: string): Promise<string> => {
  const { mail } = await sendRequest({
    url: `${MICROSOFT_GRAPH_URL}/me`,
    method: 'GET',
    headerParams: { Authorization: `Bearer ${accessToken}` },
  });

  return mail;
};

/**
 * Sync messages with messageId from webhook
 * @param {String} accountId
 * @param {String} messageId
 * @retusn {Promise} nylas messages object
 */
const syncMessages = async (accountId: string, messageId: string) => {
  const account = await Accounts.findOne({ uid: accountId }).lean();

  if (!account) {
    return debugNylas('Account not found with uid: ', accountId);
  }

  const integration = await Integrations.findOne({ accountId: account._id });

  if (!integration) {
    return debugNylas('Integration not found with accountId: ', account._id);
  }

  const { nylasToken, email, kind } = account;

  const message = await getMessageById(nylasToken, messageId);

  const [from] = message.from;

  // Prevent to send email to itself
  if (from.email === account.email && !message.subject.includes('Re:')) {
    return;
  }

  const doc = {
    kind,
    message: JSON.parse(message),
    toEmail: email,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId,
    },
  };

  // Store new received message
  return compose(
    storeMessage,
    storeConversation,
    storeCustomer,
  )(doc);
};

/**
 * Upload a file to Nylas
 * @param {String} accessToken - nylas account accessToken
 * @param {String} name
 * @param {String} path
 * @param {String} fileType
 * @returns {Promise} - nylas file object
 */
const uploadFile = async (args: INylasAttachment) => {
  const { name, path, type, accessToken } = args;

  const buffer = await fs.readFileSync(path);

  if (!buffer) {
    throw new Error('Failed to read file');
  }

  const nylas = setNylasToken(accessToken);

  const nylasFile = nylas.files.build({
    data: buffer,
    filename: name,
    contentType: type,
  });

  return new Promise((resolve, reject) => {
    nylasFile.upload((err, file) => {
      if (err) {
        reject(err);
      }

      return resolve(JSON.parse(file));
    });
  });
};

/**
 * Get attachment with file id from nylas
 * @param {String} fileId
 * @param {String} accessToken
 * @returns {Buffer} file buffer
 */
const getAttachment = (fileId: string, accessToken: string) => {
  const nylas = setNylasToken(accessToken);

  const nylasFile = nylas.files.build({ id: fileId });

  return new Promise((resolve, reject) => {
    nylasFile.download((err, file) => {
      if (err) {
        reject(err);
      }

      return resolve(file);
    });
  });
};

export {
  uploadFile,
  syncMessages,
  sendMessage,
  getMessageById,
  getMessages,
  getAttachment,
  getUserEmailFromGoogle,
  getUserEmailFromO365,
};

import * as fs from 'fs';
import { debugNylas } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { compose } from '../utils';
import {
  createOrGetNylasConversation as storeConversation,
  createOrGetNylasConversationMessage as storeMessage,
  createOrGetNylasCustomer as storeCustomer,
} from './store';
import { IMessageDraft } from './types';
import { nylasFileRequest, nylasInstanceWithToken, nylasRequest } from './utils';

/**
 * Build message and send API request
 * @param {String} - child function name
 * @param {String} - accessToken
 * @param {String} - filter
 * @param {Promise} - nylas message object
 */
const buildMessage = (child: string, ...args: string[]) => {
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
const sendMessage = (accessToken: string, args: IMessageDraft) => {
  return nylasInstanceWithToken({
    accessToken,
    name: 'drafts',
    method: 'build',
    options: args,
    action: 'send',
  });
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

  let message;

  try {
    message = await getMessageById(nylasToken, messageId);
  } catch (e) {
    debugNylas(`Failed to get nylas message by id: ${e.message}`);

    return e;
  }

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
  return compose(storeMessage, storeConversation, storeCustomer)(doc);
};

/**
 * Upload a file to Nylas
 * @param {String} accessToken - nylas account accessToken
 * @param {String} name
 * @param {String} path
 * @param {String} fileType
 * @returns {Promise} - nylas file object
 */
const uploadFile = async (file, accessToken: string) => {
  const buffer = await fs.readFileSync(file.path);

  if (!buffer) {
    throw new Error('Failed to read file');
  }

  const nylasFile = await nylasInstanceWithToken({
    accessToken,
    name: 'files',
    method: 'build',
    options: {
      data: buffer,
      filename: file.name,
      contentType: file.type,
    },
  });

  return nylasFileRequest(nylasFile, 'upload');
};

/**
 * Get attachment with file id from nylas
 * @param {String} fileId
 * @param {String} accessToken
 * @returns {Buffer} file buffer
 */
const getAttachment = async (fileId: string, accessToken: string) => {
  const nylasFile = await nylasInstanceWithToken({
    accessToken,
    name: 'files',
    method: 'build',
    options: { id: fileId },
  });

  return nylasFileRequest(nylasFile, 'download');
};

export { uploadFile, syncMessages, sendMessage, getMessageById, getMessages, getAttachment };

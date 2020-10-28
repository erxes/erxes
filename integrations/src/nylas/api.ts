import * as fs from 'fs';
import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { Integrations } from '../models';
import { IMessageDraft } from './types';

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
    filter
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
    action: 'send'
  });
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
      contentType: file.type
    }
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
    options: { id: fileId }
  });

  return nylasFileRequest(nylasFile, 'download');
};

/**
 * Check nylas credentials
 * @returns void
 */
const checkCredentials = () => {
  return Nylas.clientCredentials();
};

/**
 * Set token for nylas and
 * check credentials
 * @param {String} accessToken
 * @returns {Boolean} credentials
 */
export const setNylasToken = (accessToken: string) => {
  if (!checkCredentials()) {
    debugNylas('Nylas is not configured');

    return false;
  }

  if (!accessToken) {
    debugNylas('Access token not found');

    return false;
  }

  const nylas = Nylas.with(accessToken);

  return nylas;
};

/**
 * Request to Nylas SDK
 * @param {String} - accessToken
 * @param {String} - parent
 * @param {String} - child
 * @param {String} - filter
 * @returns {Promise} - nylas response
 */
export const nylasRequest = ({
  parent,
  child,
  accessToken,
  filter
}: {
  parent: string;
  child: string;
  accessToken: string;
  filter?: any;
}) => {
  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  return nylas[parent][child](filter)
    .then(response => response)
    .catch(e => debugNylas(e.message));
};

/**
 * Nylas file request
 */
export const nylasFileRequest = (nylasFile: any, method: string) => {
  return new Promise((resolve, reject) => {
    nylasFile[method]((err, file) => {
      if (err) {
        reject(err);
      }

      return resolve(file);
    });
  });
};

/**
 * Get Nylas SDK instrance
 */
export const nylasInstance = (
  name: string,
  method: string,
  options?: any,
  action?: string
) => {
  if (!action) {
    return Nylas[name][method](options);
  }

  return Nylas[name][method](options)[action]();
};

/**
 * Get Nylas SDK instance with token
 */
export const nylasInstanceWithToken = async ({
  accessToken,
  name,
  method,
  options,
  action
}: {
  accessToken: string;
  name: string;
  method: string;
  options?: any;
  action?: string;
}) => {
  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  const instance = nylas[name][method](options);

  if (!action) {
    return instance;
  }

  return instance[action]();
};

/**
 * Enable or Disable nylas account billing state
 * @param {String} accountId
 * @param {Boolean} enable
 */
export const enableOrDisableAccount = async (
  accountId: string,
  enable: boolean
) => {
  debugNylas(`${enable} account with uid: ${accountId}`);

  await nylasInstance('accounts', 'find', accountId).then(account => {
    if (enable) {
      return account.upgrade();
    }

    return account.downgrade();
  });
};

export const checkEmailDuplication = async (
  email: string,
  kind: string
): Promise<any> => {
  debugNylas(`Checking email duplication: ${email}`);

  const integration = await Integrations.findOne({ email, kind }).lean();

  if (integration) {
    return true;
  }

  return false;
};

export {
  uploadFile,
  sendMessage,
  getMessageById,
  getMessages,
  getAttachment,
  checkCredentials
};

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { getEnv } from '../utils';
import { GOOGLE_OAUTH_ACCESS_TOKEN_URL, GOOGLE_OAUTH_AUTH_URL, GOOGLE_SCOPES } from './constants';
import { NylasGmailConversationMessages, NylasGmailConversations, NylasGmailCustomers } from './models';
import { IMessageDraft } from './types';

// load config
dotenv.config();

const { NYLAS_CLIENT_SECRET } = process.env;

/**
 * Verify request by nylas signature
 * @param {Request} req
 * @returns {Boolean} verified request state
 */
const verifyNylasSignature = req => {
  const hmac = crypto.createHmac('sha256', NYLAS_CLIENT_SECRET);
  const digest = hmac.update(req.rawBody).digest('hex');

  return digest === req.get('x-nylas-signature');
};

/**
 * Check nylas credentials
 * @returns void
 */
const checkCredentials = () => {
  return Nylas.clientCredentials();
};

/**
 * Convert string emails to email obect
 * @param {String} emailStr - user1@mail.com, user2mail.com
 * @returns {Object} - [{ email }]
 */
const buildEmailAddress = (emailStr: string) => {
  if (!emailStr) {
    return;
  }

  return emailStr
    .split(',')
    .map(email => {
      if (email.length > 0) {
        return { email };
      }
    })
    .filter(email => email !== undefined);
};

/**
 * Set token for nylas and
 * check credentials
 * @param {String} accessToken
 * @returns {Boolean} credentials
 */
const setNylasToken = (accessToken: string) => {
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
 * Get client id and secret
 * for selected provider
 * @returns void
 */
const getClientConfig = (kind: string): string[] => {
  const providers = {
    gmail: [getEnv({ name: 'GOOGLE_CLIENT_ID' }), getEnv({ name: 'GOOGLE_CLIENT_SECRET' })],
  };

  return providers[kind];
};

/**
 * Get nylas model according to kind
 * @param {String} kind
 * @returns {Object} - Models - (gmail)
 */
const getNylasModel = (kind: string) => {
  if (kind === 'gmail') {
    return {
      Customers: NylasGmailCustomers,
      Conversations: NylasGmailConversations,
      ConversationMessages: NylasGmailConversationMessages,
    };
  }
};

/**
 * Get provider specific values
 * @param {String} kind
 * @returns {Object} configs
 */
const getProviderSettings = (kind: string) => {
  const gmail = {
    params: {
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
    },
    urls: {
      authUrl: GOOGLE_OAUTH_AUTH_URL,
      tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL,
    },
  };

  const providers = { gmail };

  return providers[kind];
};

/**
 * Request to Nylas SDK
 * @param {String} - accessToken
 * @param {String} - parent
 * @param {String} - child
 * @param {String} - filter
 * @returns {Promise} - nylas response
 */
const nylasRequest = args => {
  const {
    parent,
    child,
    accessToken,
    filter,
  }: {
    parent: string;
    child: string;
    accessToken: string;
    filter?: any;
  } = args;

  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  return nylas[parent][child](filter)
    .then(response => response)
    .catch(e => debugNylas(e.message));
};

/**
 * Draft and Send message
 * @param {Object} - args
 * @returns {Promise} - sent message
 */
const nylasSendMessage = async (accessToken: string, args: IMessageDraft) => {
  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  const draft = nylas.drafts.build(args);

  return draft
    .send()
    .then(message => debugNylas(`${message.id} message was sent`))
    .catch(error => debugNylas(error.message));
};

export {
  setNylasToken,
  getNylasModel,
  nylasSendMessage,
  getProviderSettings,
  getClientConfig,
  nylasRequest,
  checkCredentials,
  buildEmailAddress,
  verifyNylasSignature,
};

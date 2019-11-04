import * as dotenv from 'dotenv';
import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { IAccount } from '../models/Accounts';
import { sendRequest } from '../utils';
import { CONNECT_AUTHORIZE_URL, CONNECT_TOKEN_URL } from './constants';
import { updateAccount } from './store';
import { IIntegrateProvider } from './types';
import { decryptPassword, getProviderSettings } from './utils';

// loading config
dotenv.config();

const { NYLAS_CLIENT_ID, NYLAS_CLIENT_SECRET } = process.env;

/**
 * Connect provider to nylas
 * @param {String} kind
 * @param {Object} account
 */
const connectProviderToNylas = async (kind: string, account: IAccount & { _id: string }) => {
  const { email, tokenSecret } = account;

  const settings = getProviderSettings(kind, tokenSecret);

  const { access_token, account_id } = await integrateProviderToNylas({
    email,
    kind,
    settings,
  });

  await updateAccount(account._id, account_id, access_token);
};

/**
 * Connect Outlook to nylsa
 * @param {String} kind
 * @param {Object} account
 */
const connectYahooAndOutlookToNylas = async (kind: string, account: IAccount & { _id: string }) => {
  const { email, password } = account;

  const { access_token, account_id } = await integrateProviderToNylas({
    email,
    kind,
    scopes: 'email',
    settings: { username: email, password: decryptPassword(password) },
  });

  await updateAccount(account._id, account_id, access_token);
};

/**
 * Connect IMAP to Nylas
 * @param {String} kind
 * @param {Object} account
 */
const connectImapToNylas = async (kind: string, account: IAccount & { _id: string }) => {
  const { imapHost, imapPort, smtpHost, smtpPort } = account;

  if (!imapHost || !imapPort || !smtpHost || !smtpPort) {
    throw new Error('Missing imap env config');
  }

  const { email, password } = account;

  const decryptedPassword = decryptPassword(password);

  const { access_token, account_id } = await integrateProviderToNylas({
    email,
    kind,
    scopes: 'email',
    settings: {
      imap_username: email,
      imap_password: decryptedPassword,
      smtp_username: email,
      smtp_password: decryptedPassword,
      imap_host: imapHost,
      imap_port: Number(imapPort),
      smtp_host: smtpHost,
      smtp_port: Number(smtpPort),
      ssl_required: true,
    },
  });

  await updateAccount(account._id, account_id, access_token);
};

/**
 * Connect specified provider
 * and get nylas accessToken
 * @param {String} email
 * @param {String} kind
 * @param {Object} settings
 */
const integrateProviderToNylas = async (args: IIntegrateProvider) => {
  const { email, kind, settings, scopes } = args;

  const code = await getNylasCode({
    provider: kind,
    settings,
    name: email,
    email_address: email,
    client_id: NYLAS_CLIENT_ID,
    ...(scopes ? { scopes } : {}),
  });

  return getNylasAccessToken({
    code,
    client_id: NYLAS_CLIENT_ID,
    client_secret: NYLAS_CLIENT_SECRET,
  });
};

/**
 * Enable or Disable nylas account billing state
 * @param {String} accountId
 * @param {Boolean} enable
 */
const enableOrDisableAccount = async (accountId: string, enable: boolean) => {
  debugNylas(`${enable} account with uid: ${accountId}`);

  const account = await Nylas.accounts.find(accountId);

  if (enable) {
    return account.upgrade();
  }

  return account.downgrade();
};

/**
 * Revoke nylas account
 * @param {String} token
 */
const revokeAccount = async (_token: string) => {
  return Nylas.accounts
    .first()
    .then(account => account.revokeAll())
    .then(res => debugNylas(res))
    .catch(e => debugNylas(e.message));
};

/**
 * Get nylas code for accessToken
 * @param {Object} params
 * @returns {Promise} code
 */
const getNylasCode = async data => {
  const { code } = await sendRequest({
    url: CONNECT_AUTHORIZE_URL,
    method: 'post',
    body: data,
  });

  return code;
};

/**
 * Get nylas accesstoken
 * @param {Object} data
 * @param {Promise} accessToken
 */
const getNylasAccessToken = async data => {
  return sendRequest({
    url: CONNECT_TOKEN_URL,
    method: 'post',
    body: data,
  });
};

export {
  revokeAccount,
  enableOrDisableAccount,
  integrateProviderToNylas,
  connectProviderToNylas,
  connectImapToNylas,
  connectYahooAndOutlookToNylas,
};

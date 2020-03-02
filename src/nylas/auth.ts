import * as dotenv from 'dotenv';
import { debugNylas } from '../debuggers';
import Accounts, { IAccount } from '../models/Accounts';
import { getConfig, sendRequest } from '../utils';
import { CONNECT_AUTHORIZE_URL, CONNECT_TOKEN_URL, NYLAS_API_URL } from './constants';
import { updateAccount } from './store';
import { IIntegrateProvider } from './types';
import { decryptPassword, getNylasConfig, getProviderSettings, nylasInstance } from './utils';

// loading config
dotenv.config();

/**
 * Connect provider to nylas
 * @param {String} kind
 * @param {Object} account
 */
const connectProviderToNylas = async (kind: string, account: IAccount & { _id: string }) => {
  const { email, tokenSecret } = account;

  const settings = await getProviderSettings(kind, tokenSecret);

  const { access_token, account_id, billing_state } = await integrateProviderToNylas({
    email,
    kind,
    settings,
    ...(kind === 'gmail' ? { scopes: 'email.read_only,email.drafts,email.send,email.modify' } : {}),
  });

  await updateAccount(account._id, account_id, access_token, billing_state);
};

/**
 * Connect Outlook to nylsa
 * @param {String} kind
 * @param {Object} account
 */
const connectYahooAndOutlookToNylas = async (kind: string, account: IAccount & { _id: string }) => {
  const { email, password } = account;

  const { access_token, account_id, billing_state } = await integrateProviderToNylas({
    email,
    kind,
    scopes: 'email',
    settings: { username: email, password: await decryptPassword(password) },
  });

  await updateAccount(account._id, account_id, access_token, billing_state);
};

/**
 * Connect IMAP to Nylas
 * @param {String} kind
 * @param {Object} account
 */
const connectImapToNylas = async (account: IAccount & { _id: string }) => {
  const { imapHost, imapPort, smtpHost, smtpPort } = account;

  if (!imapHost || !imapPort || !smtpHost || !smtpPort) {
    throw new Error('Missing imap env config');
  }

  const { email, password } = account;

  const decryptedPassword = await decryptPassword(password);

  const { access_token, account_id, billing_state } = await integrateProviderToNylas({
    email,
    kind: 'imap',
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

  await updateAccount(account._id, account_id, access_token, billing_state);
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

  let code;

  const { NYLAS_CLIENT_ID, NYLAS_CLIENT_SECRET } = await getNylasConfig();

  try {
    const codeResponse = await sendRequest({
      url: CONNECT_AUTHORIZE_URL,
      method: 'post',
      body: {
        provider: kind,
        settings,
        name: email,
        email_address: email,
        client_id: NYLAS_CLIENT_ID,
        ...(scopes ? { scopes } : {}),
      },
    });

    code = codeResponse.code;
  } catch (e) {
    debugNylas(`Failed to get code from nylas: ${e.message}`);
    throw new Error(e);
  }

  let response;

  try {
    response = await sendRequest({
      url: CONNECT_TOKEN_URL,
      method: 'post',
      body: {
        code,
        client_id: NYLAS_CLIENT_ID,
        client_secret: NYLAS_CLIENT_SECRET,
      },
    });

    return response;
  } catch (e) {
    debugNylas(`Failed to get token from nylas: ${e.message}`);
    throw new Error(e);
  }
};

/**
 * Enable or Disable nylas account billing state
 * @param {String} accountId
 * @param {Boolean} enable
 */
const enableOrDisableAccount = async (accountId: string, enable: boolean) => {
  debugNylas(`${enable} account with uid: ${accountId}`);

  await nylasInstance('accounts', 'find', accountId).then(account => {
    if (enable) {
      return account.upgrade();
    }

    return account.downgrade();
  });

  return Accounts.updateOne({ uid: accountId }, { $set: { billingState: enable ? 'paid' : 'cancelled' } });
};

const removeExistingNylasWebhook = async (): Promise<void> => {
  const NYLAS_CLIENT_ID = await getConfig('NYLAS_CLIENT_ID');
  const NYLAS_CLIENT_SECRET = await getConfig('NYLAS_CLIENT_SECRET');

  debugNylas('Getting existing Nylas webhook');

  try {
    const existingWebhooks = await sendRequest({
      url: `${NYLAS_API_URL}/a/${NYLAS_CLIENT_ID}/webhooks`,
      method: 'get',
      headerParams: {
        Authorization: `Basic ${Buffer.from(`${NYLAS_CLIENT_SECRET}:`).toString('base64')}`,
      },
    });

    if (!existingWebhooks || existingWebhooks.length === 0) {
      return debugNylas(`No existing Nylas webhook found with NYLAS_CLIENT_ID: ${NYLAS_CLIENT_ID}`);
    }

    debugNylas(`Found: ${existingWebhooks.length} Nylas webhooks`);

    for (const webhook of existingWebhooks) {
      await sendRequest({
        url: `${NYLAS_API_URL}/a/${NYLAS_CLIENT_ID}/webhooks/${webhook.id}`,
        method: 'delete',
        headerParams: {
          Authorization: `Basic ${Buffer.from(`${NYLAS_CLIENT_SECRET}:`).toString('base64')}`,
        },
      });
    }

    debugNylas(`Successfully removed existing Nylas webhooks`);
  } catch (e) {
    debugNylas(e.message);
  }
};

export {
  removeExistingNylasWebhook,
  enableOrDisableAccount,
  integrateProviderToNylas,
  connectProviderToNylas,
  connectImapToNylas,
  connectYahooAndOutlookToNylas,
};

import * as dotenv from 'dotenv';
import { debugNylas } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { Accounts, Integrations } from '../models';
import { getConfig, sendRequest } from '../utils';
import { checkEmailDuplication, enableOrDisableAccount } from './api';
import {
  CONNECT_AUTHORIZE_URL,
  CONNECT_TOKEN_URL,
  NYLAS_API_URL,
  NYLAS_CALENDAR_SCOPES,
  NYLAS_GMAIL_SCOPES
} from './constants';
import { IIntegrateProvider, INylasIntegrationData } from './types';
import { getNylasConfig, getProviderSettings } from './utils';

// loading config
dotenv.config();

/**
 * Connect provider to nylas
 * @param {String} kind
 * @param {Object} account
 */
const connectProviderToNylas = async ({
  uid,
  integrationId,
  isCalendar
}: {
  uid: string;
  integrationId?: string;
  isCalendar?: boolean;
}) => {
  const crendentialKey = `${uid}-credential`;

  const providerCredential = await memoryStorage().get(crendentialKey, false);

  if (!providerCredential) {
    throw new Error(`Refresh token not found ${uid}`);
  }

  const [
    email,
    refreshToken,
    kind,
    googleAccessToken
  ] = providerCredential.split(',');

  if (integrationId) {
    const isEmailDuplicated = await checkEmailDuplication(email, kind);

    if (isEmailDuplicated) {
      throw new Error(`${email} is already exists`);
    }
  } else {
    const account = await Accounts.findOne({ email, kind });

    if (account) {
      return { account, isAlreadyExists: true };
    }
  }

  const settings = await getProviderSettings(kind, refreshToken);

  try {
    const {
      access_token,
      account_id,
      billing_state,
      name
    } = await integrateProviderToNylas({
      email,
      kind,
      settings,
      ...(kind === 'gmail'
        ? { scopes: isCalendar ? NYLAS_CALENDAR_SCOPES : NYLAS_GMAIL_SCOPES }
        : {})
    });

    await memoryStorage().removeKey(crendentialKey);

    const nylasAccountId = account_id;
    const status = 'paid';

    if (billing_state === 'cancelled') {
      await enableOrDisableAccount(nylasAccountId, true);
    }

    if (integrationId) {
      await createIntegration({
        kind,
        email,
        integrationId,
        nylasToken: access_token,
        nylasAccountId,
        status,
        googleAccessToken
      });
    } else {
      const newAccount = await Accounts.create({
        name,
        kind,
        email,
        googleAccessToken,
        nylasToken: access_token,
        nylasAccountId,
        nylasBillingState: status
      });

      return { account: newAccount };
    }
  } catch (e) {
    throw e;
  }
};

/**
 * Connect Outlook to nylsa
 * @param {String} kind
 * @param {Object} account
 */
const connectYahooAndOutlookToNylas = async (
  kind: string,
  integrationId: string,
  data: INylasIntegrationData
) => {
  const { email, password } = data;

  try {
    const {
      access_token,
      account_id,
      billing_state
    } = await integrateProviderToNylas({
      email,
      kind,
      scopes: 'email',
      settings: { username: email, password }
    });

    await createIntegration({
      kind,
      email,
      integrationId,
      nylasToken: access_token,
      nylasAccountId: account_id,
      status: billing_state
    });
  } catch (e) {
    throw e;
  }
};

const connectExchangeToNylas = async (
  integrationId: string,
  data: INylasIntegrationData
) => {
  const { username = '', password, email, host } = data;

  if (!password || !email || !host) {
    throw new Error('Missing Exhange config');
  }

  try {
    const {
      access_token,
      account_id,
      billing_state
    } = await integrateProviderToNylas({
      email,
      kind: 'exchange',
      scopes: 'email',
      settings: {
        username,
        password,
        eas_server_host: host
      }
    });

    await createIntegration({
      email,
      kind: 'exchange',
      integrationId,
      nylasToken: access_token,
      nylasAccountId: account_id,
      status: billing_state
    });
  } catch (e) {
    throw e;
  }
};

const connectImapToNylas = async (
  integrationId: string,
  data: INylasIntegrationData
) => {
  const { imapHost, imapPort, smtpHost, smtpPort } = data;

  if (!imapHost || !imapPort || !smtpHost || !smtpPort) {
    throw new Error('Missing imap config');
  }

  const { email, password } = data;

  try {
    const {
      access_token,
      account_id,
      billing_state
    } = await integrateProviderToNylas({
      email,
      kind: 'imap',
      scopes: 'email',
      settings: {
        imap_username: email,
        imap_password: password,
        smtp_username: email,
        smtp_password: password,
        imap_host: imapHost,
        imap_port: Number(imapPort),
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        ssl_required: true
      }
    });

    await createIntegration({
      email,
      kind: 'imap',
      integrationId,
      nylasToken: access_token,
      nylasAccountId: account_id,
      status: billing_state
    });
  } catch (e) {
    throw e;
  }
};

/**
 * Connect specified provider
 * and get nylas accessToken
 * @param {String} email
 * @param {String} kind
 * @param {Object} settings
 */
export const integrateProviderToNylas = async (args: IIntegrateProvider) => {
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
        ...(scopes ? { scopes } : {})
      }
    });

    code = codeResponse.code;
  } catch (e) {
    debugNylas(`Failed to get token code nylas: ${e}`);
    throw new Error(
      'Error when connecting to the server. Please check your settings'
    );
  }

  let response;

  try {
    response = await sendRequest({
      url: CONNECT_TOKEN_URL,
      method: 'post',
      body: {
        code,
        client_id: NYLAS_CLIENT_ID,
        client_secret: NYLAS_CLIENT_SECRET
      }
    });

    return response;
  } catch (e) {
    debugNylas(`Failed to get token from nylas: ${e}`);
    throw new Error(
      'Error when connecting to the server. Please check your settings'
    );
  }
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
        Authorization: `Basic ${Buffer.from(`${NYLAS_CLIENT_SECRET}:`).toString(
          'base64'
        )}`
      }
    });

    if (!existingWebhooks || existingWebhooks.length === 0) {
      return debugNylas(
        `No existing Nylas webhook found with NYLAS_CLIENT_ID: ${NYLAS_CLIENT_ID}`
      );
    }

    debugNylas(`Found: ${existingWebhooks.length} Nylas webhooks`);

    for (const webhook of existingWebhooks) {
      await sendRequest({
        url: `${NYLAS_API_URL}/a/${NYLAS_CLIENT_ID}/webhooks/${webhook.id}`,
        method: 'delete',
        headerParams: {
          Authorization: `Basic ${Buffer.from(
            `${NYLAS_CLIENT_SECRET}:`
          ).toString('base64')}`
        }
      });
    }

    debugNylas(`Successfully removed existing Nylas webhooks`);
  } catch (e) {
    debugNylas(e.message);
  }
};

const createIntegration = async ({
  email,
  integrationId,
  nylasAccountId,
  nylasToken,
  status,
  kind,
  googleAccessToken
}: {
  email?: string;
  integrationId: string;
  nylasAccountId: string;
  nylasToken: string;
  status: string;
  kind: string;
  googleAccessToken?: string;
}) => {
  if (status === 'cancelled') {
    await enableOrDisableAccount(nylasAccountId, true);
  }

  return Integrations.create({
    ...(email ? { email } : {}),
    kind,
    erxesApiId: integrationId,
    googleAccessToken,
    nylasToken,
    nylasAccountId,
    nylasBillingState: 'paid'
  });
};

export {
  removeExistingNylasWebhook,
  connectProviderToNylas,
  connectImapToNylas,
  connectYahooAndOutlookToNylas,
  connectExchangeToNylas
};

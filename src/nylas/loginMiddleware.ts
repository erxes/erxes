import * as dotenv from 'dotenv';
import * as querystring from 'querystring';
import { debugNylas, debugRequest } from '../debuggers';
import { Accounts } from '../models';
import { sendRequest } from '../utils';
import { getUserEmailFromGoogle, getUserEmailFromO365 } from './api';
import { AUTHORIZED_REDIRECT_URL } from './constants';
import { checkCredentials, encryptPassword, getClientConfig, getProviderConfigs } from './utils';

// loading config
dotenv.config();

const { DOMAIN } = process.env;

const globals: { kind?: string } = {};

// Provider specific OAuth2 ===========================
const getOAuthCredentials = async (req, res, next) => {
  debugRequest(debugNylas, req);

  let { kind } = req.query;

  if (kind) {
    // for redirect
    globals.kind = kind;
  } else {
    kind = globals.kind;
  }

  if (kind.includes('nylas')) {
    kind = kind.split('-')[1];
  }

  if (!checkCredentials()) {
    return next('Nylas not configured, check your env');
  }

  const [clientId, clientSecret] = getClientConfig(kind);

  if (!clientId || !clientSecret) {
    return next(`Missing config check your env of ${kind}`);
  }

  debugRequest(debugNylas, req);

  const redirectUri = `${DOMAIN}/nylas/oauth2/callback`;

  const { params, urls, otherParams } = getProviderConfigs(kind);

  if (!req.query.code) {
    if (!req.query.error) {
      const commonParams = {
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        ...params,
      };

      return res.redirect(urls.authUrl + querystring.stringify(commonParams));
    } else {
      return next('access denied');
    }
  }

  const data = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    ...(kind === 'office365' ? { scope: 'https://graph.microsoft.com/user.read' } : {}), // for graph api to get user info
  };

  const { access_token, refresh_token } = await sendRequest({
    url: urls.tokenUrl,
    method: 'post',
    body: data,
    ...otherParams,
  });

  let email;

  switch (kind) {
    case 'gmail':
      email = await getUserEmailFromGoogle(access_token);
      break;
    case 'office365':
      email = await getUserEmailFromO365(access_token);
      break;
  }

  const doc = {
    email,
    kind,
    name: email,
    scope: params.scope,
    token: access_token,
    tokenSecret: refresh_token,
  };

  await Accounts.create(doc);

  res.redirect(AUTHORIZED_REDIRECT_URL);
};

/**
 * Create IMAP account
 * @param {String} username
 * @param {String} password
 * @param {String} email
 */
const authenticateIMAP = async (req, res, next) => {
  debugRequest(debugNylas, req);

  const {
    email,
    password,
    imapHost,
    imapPort,
    smtpPort,
    smtpHost,
  }: {
    email: string;
    password: string;
    imapHost: string;
    smtpHost: string;
    imapPort: number;
    smtpPort: number;
  } = req.body;

  if (!email || !password || !imapHost || !imapPort || !smtpHost || !smtpPort) {
    return next('Missing IMAP, SMTP, email, password config');
  }

  debugNylas(`Creating account with email: ${email}`);

  await Accounts.create({
    email,
    imapHost,
    imapPort,
    smtpPort,
    smtpHost,
    password: encryptPassword(password),
    name: email,
    kind: 'imap',
  });

  res.redirect(AUTHORIZED_REDIRECT_URL);
};

export { getOAuthCredentials, authenticateIMAP };

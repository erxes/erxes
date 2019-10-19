import * as dotenv from 'dotenv';
import * as querystring from 'querystring';
import { debugNylas, debugRequest } from '../debuggers';
import { Accounts } from '../models';
import { sendRequest } from '../utils';
import { getEmailFromAccessToken } from './api';
import { AUTHORIZED_REDIRECT_URL } from './constants';
import { checkCredentials, encryptPassword, getClientConfig, getProviderSettings } from './utils';

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

  const { params, urls, requestParams } = getProviderSettings(kind);

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
  };

  const { access_token, refresh_token } = await sendRequest({
    url: urls.tokenUrl,
    method: 'post',
    body: data,
    ...requestParams,
  });

  const email = await getEmailFromAccessToken(access_token);

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

  const { email, password } = req.body;

  if (!email || !password) {
    return next('Missing email or password');
  }

  debugNylas(`Creating account with email: ${email}`);

  await Accounts.create({
    email,
    password: encryptPassword(password),
    name: email,
    kind: 'imap',
  });

  res.redirect(AUTHORIZED_REDIRECT_URL);
};

export { getOAuthCredentials, authenticateIMAP };

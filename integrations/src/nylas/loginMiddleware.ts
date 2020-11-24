import * as dotenv from 'dotenv';
import * as querystring from 'querystring';
import { debugNylas, debugRequest } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { generateUid, sendRequest } from '../utils';
import { checkCredentials } from './api';
import {
  AUTHORIZED_CALENDAR_REDIRECT_URL,
  AUTHORIZED_REDIRECT_URL,
  GOOGLE_OAUTH_TOKEN_VALIDATION_URL,
  MICROSOFT_GRAPH_URL
} from './constants';
import { getClientConfig, getProviderConfigs } from './utils';

// loading config
dotenv.config();

const { DOMAIN } = process.env;

// Provider specific OAuth2 ===========================
const getOAuthCredential = async (req, res, next) => {
  debugRequest(debugNylas, req);

  const state = req.query.state;
  let { type, kind } = req.query;

  if (state) {
    kind = state.split('&&')[0];
    type = state.split('&&')[1];
  }

  if (!state && kind) {
    kind = kind.split('-')[1];
  }

  if (!checkCredentials()) {
    return next(new Error('Nylas not configured, check your env'));
  }

  const [clientId, clientSecret] = await getClientConfig(kind);

  if (!clientId || !clientSecret) {
    return next(new Error(`Missing config check your env of ${kind}`));
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
        state: type ? `${kind}&&${type}` : kind,
        ...params
      };

      return res.redirect(urls.authUrl + querystring.stringify(commonParams));
    } else {
      return next(new Error('access denied'));
    }
  }

  const data = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: redirectUri,
    client_id: clientId,
    state: '',
    client_secret: clientSecret,
    ...(kind === 'office365'
      ? { scope: 'https://graph.microsoft.com/user.read' }
      : {})
  };

  // Google | O365 tokens
  const { access_token, refresh_token } = await sendRequest({
    url: urls.tokenUrl,
    method: 'post',
    body: data,
    ...otherParams
  });

  let email;

  switch (kind) {
    case 'gmail':
      const gmailDoc = {
        access_token,
        fields: ['email']
      };

      const gmailResponse = await sendRequest({
        url: GOOGLE_OAUTH_TOKEN_VALIDATION_URL,
        method: 'post',
        body: gmailDoc
      });

      email = gmailResponse.email;
      break;
    case 'office365':
      const officeResponse = await sendRequest({
        url: `${MICROSOFT_GRAPH_URL}/me`,
        method: 'GET',
        headerParams: { Authorization: `Bearer ${access_token}` }
      });

      email = officeResponse.mail;
      break;
  }

  const uid = generateUid();
  // We will use email and refresh_token
  // when user create the Gmail or O365 integration
  await memoryStorage().set(
    `${uid}-credential`,
    `${email},${refresh_token},${kind},${access_token}`
  );

  let url = `${AUTHORIZED_REDIRECT_URL}?uid=${uid}#show${kind}Modal=true`;

  if (type === 'calendar') {
    url = `${AUTHORIZED_CALENDAR_REDIRECT_URL}?uid=${uid}#showCalendarModal=true`;
  }

  return res.redirect(url);
};

export default getOAuthCredential;

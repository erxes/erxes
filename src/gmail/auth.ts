import { google } from 'googleapis';
import { debugGmail } from '../debuggers';
import { Accounts } from '../models';
import { getEnv } from '../utils';
import { SCOPES_GMAIL } from './constant';
import { ICredentials } from './types';

const gmail: any = google.gmail('v1');

export const gmailClient = gmail.users;

const getOauthClient = () => {
  const GOOGLE_CLIENT_ID = getEnv({ name: 'GOOGLE_CLIENT_ID' });
  const GOOGLE_CLIENT_SECRET = getEnv({ name: 'GOOGLE_CLIENT_SECRET' });
  const GMAIL_REDIRECT_URL = `${getEnv({ name: 'DOMAIN' })}/gmaillogin`;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return debugGmail(`
      Error Google: Missing env values
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    `);
  }

  let response;

  try {
    response = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REDIRECT_URL);
  } catch (e) {
    debugGmail(`
      Error Google: Could not create OAuth2 Client with
      ${GOOGLE_CLIENT_ID}
      ${GOOGLE_CLIENT_SECRET}
    `);
    return;
  }

  return response;
};

// Google OAuthClient ================
const oauth2Client = getOauthClient();

/**
 * Get OAuth client with given credentials
 */
export const getAuth = (credentials: ICredentials, accountId?: string) => {
  oauth2Client.on('tokens', async tokens => {
    await refreshAccessToken(accountId, credentials);

    credentials = tokens;
  });

  oauth2Client.setCredentials(credentials);

  return oauth2Client;
};

/**
 * Get auth url depends on google services such us gmail, calendar
 */
export const getAuthorizeUrl = (): string => {
  const options = { access_type: 'offline', scope: SCOPES_GMAIL };

  let authUrl;

  debugGmail(`
    Google OAuthClient generate auth url with following data
    ${options}
  `);

  try {
    authUrl = oauth2Client.generateAuthUrl(options);
  } catch (e) {
    debugGmail(`Google OAuthClient failed to generate auth url`);
  }

  return authUrl;
};

/**
 * Get access token from gmail callback
 */
export const getAccessToken = async (code: string) => {
  let accessToken;

  debugGmail(`Google OAuthClient request to get token with ${code}`);

  try {
    accessToken = await new Promise((resolve, reject) =>
      oauth2Client.getToken(code, (err: any, token: ICredentials) => {
        if (err) {
          return reject(err.response.data.error);
        }

        return resolve(token);
      }),
    );
  } catch (e) {
    debugGmail(`Error Google: Google OAuthClient failed to get access token with ${code}`);
  }

  return accessToken;
};

/*
 * Refresh token and save when access_token expires
 */
export const refreshAccessToken = async (_id: string, tokens: ICredentials): Promise<void> => {
  const account = await Accounts.findOne({ _id });

  if (!account) {
    debugGmail(`Error Google: Account not found id with ${_id}`);
    return;
  }

  account.token = tokens.access_token;

  if (tokens.refresh_token) {
    account.tokenSecret = tokens.refresh_token;
  }

  if (tokens.expiry_date) {
    account.expireDate = tokens.expiry_date;
  }

  await account.save();
};

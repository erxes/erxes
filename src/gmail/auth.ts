import { google } from 'googleapis';
import { debugGmail } from '../debuggers';
import { Accounts } from '../models';
import { getEnv } from '../utils';
import { SCOPES_GMAIL } from './constant';
import { ICredentials } from './types';
import { getGoogleConfigs } from './util';

const gmail: any = google.gmail({
  version: 'v1',
});

export const gmailClient = gmail.users;

export const getOauthClient = async () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await getGoogleConfigs();

  const GMAIL_REDIRECT_URL = `${getEnv({ name: 'DOMAIN' })}/gmaillogin`;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(`
      Error Google: Missing env values
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    `);
  }

  try {
    return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REDIRECT_URL);
  } catch (e) {
    debugGmail(`
      Error Google: Could not create OAuth2 Client with
      ${GOOGLE_CLIENT_ID}
      ${GOOGLE_CLIENT_SECRET}
    `);

    throw e;
  }
};

export const getAuthorizeUrl = async (): Promise<string> => {
  debugGmail(`Google OAuthClient generate auth url`);

  try {
    const auth = await getOauthClient();

    return auth.generateAuthUrl({ access_type: 'offline', scope: SCOPES_GMAIL });
  } catch (e) {
    debugGmail(`Google OAuthClient failed to generate auth url`);
    throw e;
  }
};

export const getAccessToken = async (code: string): Promise<ICredentials> => {
  debugGmail(`Google OAuthClient request to get token with ${code}`);

  try {
    const oauth2Client = await getOauthClient();

    return new Promise((resolve, reject) =>
      oauth2Client.getToken(code, (err: any, token: ICredentials) => {
        if (err) {
          return reject(new Error(err.response.data.error));
        }

        // set access token
        oauth2Client.setCredentials(token);

        return resolve(token);
      }),
    );
  } catch (e) {
    debugGmail(`Error Google: Google OAuthClient failed to get access token with ${code}`);
    throw e;
  }
};

export const refreshAccessToken = async (_id: string, tokens: ICredentials): Promise<void> => {
  const account = await Accounts.findOne({ _id });

  if (!account) {
    return debugGmail(`Error Google: Account not found id with ${_id}`);
  }

  account.token = tokens.access_token;

  if (tokens.refresh_token) {
    account.tokenSecret = tokens.refresh_token;
  }

  if (tokens.expiry_date) {
    account.expireDate = tokens.expiry_date.toString();
  }

  await account.save();
};

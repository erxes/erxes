import { google } from 'googleapis';
import * as request from 'request';
import { debugGmail } from '../debuggers';
import { getEnv } from '../utils';
import { SCOPES_GMAIL } from './constant';
import { ICredentials, IMessage, IMessageAdded } from './types';
import { getGoogleConfigs } from './util';
import { parseBatchResponse } from './util';

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

/**
 * Gets the current user's Gmail profile
 */
export const getProfile = async (credentials: ICredentials, email?: string) => {
  debugGmail(`Gmail get an user profile`);

  try {
    const auth = await getOauthClient();

    auth.setCredentials(credentials);

    return gmailClient.getProfile({
      auth,
      userId: email || 'me',
    });
  } catch (e) {
    debugGmail(`Error Google: Gmail failed to get user profile ${e}`);
    throw e;
  }
};

export const composeEmail = async ({
  credentials,
  message,
  threadId,
}: {
  credentials: ICredentials;
  message: string;
  accountId: string;
  threadId?: string;
}) => {
  try {
    const auth = await getOauthClient();

    auth.setCredentials(credentials);

    const params = {
      auth,
      userId: 'me',
      response: { threadId },
      uploadType: 'multipart',
      media: {
        mimeType: 'message/rfc822',
        body: message,
      },
    };

    return gmailClient.messages.send(params);
  } catch (e) {
    debugGmail(`Error Google: Could not send email ${e}`);
    throw e;
  }
};

export const getAttachment = async (credentials: ICredentials, messageId: string, attachmentId: string) => {
  debugGmail('Request to get an attachment');

  try {
    const auth = await getOauthClient();

    auth.setCredentials(credentials);

    const response = await gmailClient.messages.attachments.get({
      id: attachmentId,
      userId: 'me',
      messageId,
    });

    return response.data || '';
  } catch (e) {
    debugGmail(`Failed to get attachment: ${e}`);
    throw e;
  }
};

export const sendSingleRequest = async (auth: any, messages: IMessageAdded[]) => {
  const [data] = messages;
  const { message } = data;

  let response: IMessage;

  debugGmail(`Request to get a single message`);

  try {
    response = await gmailClient.messages.get({
      auth,
      userId: 'me',
      id: message.id,
    });
  } catch (e) {
    debugGmail(`Error Google: Request to get a single message failed ${e}`);
    throw e;
  }

  return response;
};

/**
 * Send multiple request at once
 */
export const sendBatchRequest = (auth: any, messages: IMessageAdded[]) => {
  debugGmail('Sending batch request');

  const { credentials } = auth;
  const { access_token } = credentials;
  const boundary = 'erxes';

  let body = '';

  for (const item of messages) {
    body += `--${boundary}\n`;
    body += 'Content-Type: application/http\n\n';
    body += `GET /gmail/v1/users/me/messages/${item.message.id}?format=full\n`;
  }

  body += `--${boundary}--\n`;

  const headers = {
    'Content-Type': 'multipart/mixed; boundary=' + boundary,
    Authorization: 'Bearer ' + access_token,
  };

  return new Promise((resolve, reject) => {
    request.post(
      'https://www.googleapis.com/batch/gmail/v1',
      {
        body,
        headers,
      },
      (error, response, _body) => {
        if (!error && response.statusCode === 200) {
          const payloads = parseBatchResponse(_body);

          return resolve(payloads);
        }

        return reject(error);
      },
    );
  });
};

export const getHistoryList = async (auth: any, startHistoryId: string) => {
  try {
    const historyResponse = await gmailClient.history.list({
      auth,
      userId: 'me',
      startHistoryId,
    });

    const { data = {} } = historyResponse;

    if (!data.history || !data.historyId) {
      debugGmail(`No changes made with given historyId ${startHistoryId}`);
      return;
    }

    return data;
  } catch (e) {
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

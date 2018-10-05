import { google } from 'googleapis';
import * as request from 'request';
import { ActivityLogs, Integrations } from '../db/models';
import { getOauthClient } from './googleTracker';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';

interface IMailParams {
  integrationId: string;
  cocType: string;
  cocId: string;
  subject: string;
  body: string;
  toEmails: string;
  cc: string;
  bcc: string;
  attachments: string[];
}

/**
 * Get file by url into fileStream buffer
 */
const getInBufferAttachFile = (url: string) =>
  new Promise((resolve, reject) =>
    request.get({ url, encoding: null }, (error, response, body) => {
      if (error) {
        reject(error);
      }

      resolve({
        body,
        contentLength: response.headers['content-length'],
        contentType: response.headers['content-type'],
      });
    }),
  );

/**
 * Create string sequence that generates email body encrypted to base64
 */
const encodeEmail = async (
  toEmail: string,
  fromEmail: string,
  subject: string,
  body: string,
  attachments?: string[],
  ccEmails?: string,
  bccEmails?: string,
) => {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  let rawEmail = [
    'Content-Type: multipart/mixed; boundary="erxes"',
    'MIME-Version: 1.0',
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Cc: ${ccEmails || ''}`,
    `Bcc: ${bccEmails || ''}`,
    `Subject: ${utf8Subject}`,
    '',
    '--erxes',
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
    '',
  ].join('\r\n');

  if (attachments) {
    for (const attachmentUrl of attachments) {
      const attach: any = await getInBufferAttachFile(attachmentUrl);
      const splitedUrl = attachmentUrl.split('/');
      const fileName = splitedUrl[splitedUrl.length - 1];

      rawEmail += [
        '--erxes',
        `Content-Type: ${attach.contentType}`,
        'MIME-Version: 1.0',
        `Content-Length: ${attach.contentLength}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${fileName}"`,
        '',
        attach.body.toString('base64'),
        '',
      ].join('\r\n');
    }
  }

  rawEmail += '--erxes--\r\n';

  return Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Send email & create activiy log with gmail kind
 */
export const sendGmail = async (mailParams: IMailParams, userId: string) => {
  const { integrationId, subject, body, toEmails, cc, bcc, attachments, cocType, cocId } = mailParams;

  const integration = await Integrations.findOne({ _id: integrationId });

  if (!integration || !integration.gmailData) {
    throw new Error(`Integration not found id with ${integrationId}`);
  }

  const fromEmail = integration.gmailData.email;

  const auth = getOauthClient('gmail');

  auth.setCredentials(integration.gmailData.credentials);

  const gmail: any = await google.gmail('v1');

  const raw = await encodeEmail(toEmails, fromEmail, subject, body, attachments, cc, bcc);

  const activityLogContent = JSON.stringify({
    toEmails,
    subject,
    body,
    attachments,
    cc,
    bcc,
  });

  return new Promise((resolve, reject) => {
    const data = {
      auth,
      userId: 'me',
      resource: {
        raw,
      },
    };

    gmail.users.messages.send(data, (err, response) => {
      if (err) {
        reject(err);
      }

      // Create activity log for send gmail
      ActivityLogs.createGmailLog(activityLogContent, cocType, cocId, userId);

      resolve(response);
    });
  });
};

/**
 * Get permission granted email information
 */
export const getGmailUserProfile = async (
  credentials: Credentials,
): Promise<{ emailAddress?: string; historyId?: string }> => {
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  const gmail: any = await google.gmail('v1');

  return new Promise((resolve, reject) => {
    gmail.users.getProfile({ auth, userId: 'me' }, (err, response) => {
      if (err) {
        reject(err);
      }

      resolve(response.data);
    });
  });
};

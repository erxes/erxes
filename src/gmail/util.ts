import { debugGmail } from '../debuggers';
import Accounts, { IAccount } from '../models/Accounts';
import { getCommonGoogleConfigs, getConfig } from '../utils';
import { ICredentials } from './types';

export const getCredentialsByEmailAccountId = async ({
  email,
  accountId,
}: {
  email?: string;
  accountId?: string;
}): Promise<ICredentials> => {
  const selector: any = {};

  if (accountId) {
    selector._id = accountId;
  }

  if (email) {
    selector.uid = email;
  }

  const account = await Accounts.findOne(selector);

  if (!account) {
    debugGmail('Error Google: Account not found!');
    return;
  }

  return getCredentials(account);
};

/**
 * Get credential values from account and return formatted
 */
export const getCredentials = (credentials: IAccount): ICredentials => ({
  access_token: credentials.token,
  refresh_token: credentials.tokenSecret,
  expiry_date: parseInt(credentials.expireDate, 10),
  scope: credentials.scope,
});

/**
 * Exctract string from to, cc, bcc
 * ex: Name <user@mail.com>
 */
export const extractEmailFromString = (str?: string) => {
  if (!str || str.length === 0) {
    return '';
  }

  const emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
  const emails = str.match(emailRegex);

  if (!emails) {
    return '';
  }

  return emails.join(' ');
};

/**
 * Parse result of users.messages.get response
 */
export const parseMessage = (response: any) => {
  const { id, threadId, payload, labelIds } = response;

  if (!payload || labelIds.includes('TRASH') || labelIds.includes('DRAFT')) {
    return;
  }

  let headers = mapHeaders(payload.headers);
  let data: any = getHeaderProperties(headers, id, threadId, labelIds);

  let parts = [payload];
  let firstPartProcessed = false;

  while (parts.length !== 0) {
    const part = parts.shift();

    if (part.parts) {
      parts = parts.concat(part.parts);
    }

    if (firstPartProcessed) {
      headers = mapHeaders(part.headers);
    }

    if (!part.body) {
      continue;
    }

    data = getBodyProperties(headers, part, data);

    firstPartProcessed = true;
  }

  return data;
};

/**
 * Set header keys to lower case
 */
export const mapHeaders = (headers: any) => {
  if (!headers) {
    return {};
  }

  return headers.reduce((result, header) => {
    result[header.name.toLowerCase()] = header.value;
    return result;
  }, {});
};

/**
 * Get headers specific values from gmail.users.messages.get response
 */
const getHeaderProperties = (headers: any, messageId: string, threadId: string, labelIds: string[]) => {
  return {
    subject: headers.subject,
    from: headers.from,
    to: headers.to,
    cc: headers.cc,
    bcc: headers.bcc,
    ...(headers.references ? { references: headers.references } : {}),
    headerId: headers['message-id'],
    reply: headers['in-reply-to'],
    messageId,
    threadId,
    labelIds,
  };
};

/**
 * Get other parts of gmail.users.messages.get response such us html, plain text, attachment
 */
const getBodyProperties = (headers: any, part: any, data: any) => {
  const isHtml = part.mimeType && part.mimeType.includes('text/html');
  const isPlain = part.mimeType && part.mimeType.includes('text/plain');
  const cd = headers['content-disposition'];
  const isAttachment = cd && cd.includes('attachment');
  const isInline = cd && cd.includes('inline');

  // get html content
  if (isHtml && !isAttachment) {
    data.textHtml = Buffer.from(part.body.data, 'base64').toString();

    // get plain text
  } else if (isPlain && !isAttachment) {
    data.textPlain = Buffer.from(part.body.data, 'base64').toString();

    // get attachments
  } else if (isAttachment || isInline) {
    const body = part.body;

    if (!data.attachments) {
      data.attachments = [];
    }

    data.attachments.push({
      filename: part.filename,
      mimeType: part.mimeType,
      size: body.size,
      attachmentId: body.attachmentId,
    });
  }

  return data;
};

export const parseBatchResponse = (body: string) => {
  // Not the same delimiter in the response as we specify ourselves in the request,
  // so we have to extract it.
  const delimiter = body.substr(0, body.indexOf('\r\n'));
  const parts = body.split(delimiter);
  // The first part will always be an empty string. Just remove it.
  parts.shift();
  // The last part will be the "--". Just remove it.
  parts.pop();

  const result: any = [];

  for (const part of parts) {
    const p = part.substring(part.indexOf('{'), part.lastIndexOf('}') + 1);
    result.push(JSON.parse(p));
  }

  return result;
};

export const buildEmail = (rawString: string) => {
  if (!rawString) {
    return;
  }

  const emails = extractEmailFromString(rawString);

  return emails
    .split(' ')
    .map(email => {
      if (email) {
        return { email };
      }
    })
    .filter(email => email !== undefined);
};

export const getGoogleConfigs = async () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_PROJECT_ID,
    GOOGLE_APPLICATION_CREDENTIALS,
  } = await getCommonGoogleConfigs();

  return {
    GOOGLE_PROJECT_ID,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_GMAIL_TOPIC: await getConfig('GOOGLE_GMAIL_TOPIC', 'gmail_topic'),
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_GMAIL_SUBSCRIPTION_NAME: await getConfig('GOOGLE_GMAIL_SUBSCRIPTION_NAME', 'gmail_topic_subscription'),
  };
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

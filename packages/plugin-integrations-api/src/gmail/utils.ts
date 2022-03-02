import * as parseMessage from 'gmail-api-parse-message';
import { debugError } from '../debuggers';
import { Accounts } from '../models';
import { getCommonGoogleConfigs, sendRequest } from '../utils';
import { BASE_URL } from './constant';
import { IGmailRequest, IMailParams } from './types';

/**
 * Extract string from to, cc, bcc
 * ex: Name <user@mail.com>
 */
export const extractEmailFromString = (str?: string): string => {
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

export const getEmailsAsObject = (
  rawString: string
): Array<{ email: string }> => {
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

export const parseEmailHeader = (
  value: string
): { name: string; email: string } => {
  const header = value.trim();

  const extract = { name: '', email: '' };

  const emails = header.match(/[^@<\s]+@[^@\s>]+/g);

  if (emails) {
    extract.email = emails[0];
  }

  const names = header.split(/\s+/);

  if (names.length > 1) {
    names.pop();
    extract.name = names.join(' ').replace(/"/g, '');
  }

  return extract;
};

export const parseMail = (mails: any) => {
  const docs = [];

  for (const mail of mails) {
    const doc: any = {};

    const mailObject = parseMessage(mail);

    const { id, labelIds, threadId, headers } = mailObject;

    doc.messageId = id;
    doc.labelIds = labelIds;
    doc.threadId = threadId;

    if (headers.subject) {
      doc.subject = headers.subject;
    }

    if (headers.from) {
      const { email, name } = parseEmailHeader(headers.from);

      doc.from = headers.from;
      doc.sender = name;
      doc.fromEmail = email;
    }

    if (headers.to) {
      doc.to = extractEmailFromString(headers.to);
    }

    if (headers.cc) {
      doc.cc = extractEmailFromString(headers.cc);
    }

    if (headers.bcc) {
      doc.bcc = extractEmailFromString(headers.bcc);
    }

    if (headers['reply-to']) {
      doc.replyTo = headers['reply-to'];
    }

    if (headers['in-reply-to']) {
      doc.inReplyTo = headers['in-reply-to'];
    }

    if (headers.references) {
      doc.references = mailObject.references;
    }

    if (headers['message-id']) {
      doc.headerId = headers['message-id'];
    }

    if (mailObject.textHtml) {
      doc.html = mailObject.textHtml;
    }

    if (mailObject.attachments) {
      doc.attachments = mailObject.attachments;
    }

    docs.push(doc);
  }

  return docs;
};

export const chunkSubstr = (str: string, size: number) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

/**
 * Create a MIME message that complies with RFC 2822
 * @see {https://tools.ietf.org/html/rfc2822}
 */
export const createMimeMessage = (mailParams: IMailParams): string => {
  const {
    bcc,
    cc,
    to,
    body,
    headerId,
    references,
    inReplyTo,
    from,
    subject,
    attachments
  } = mailParams;

  const nl = '\n';
  const boundary = '__erxes__';

  const mimeBase = [
    'MIME-Version: 1.0',
    'To: ' + to, // "user1@email.com, user2@email.com"
    'From: <' + from + '>',
    'Subject: ' + subject
  ];

  // Reply
  if (references) {
    mimeBase.push('References:' + references);
  }

  if (inReplyTo) {
    mimeBase.push(['In-Reply-To: ' + inReplyTo].join(nl));
  }

  if (headerId) {
    mimeBase.push(
      ['In-Reply-To: ' + headerId, 'Message-ID: ' + headerId].join(nl)
    );
  }

  if (cc && cc.length > 0) {
    mimeBase.push('Cc: ' + cc);
  }

  if (bcc && bcc.length > 0) {
    mimeBase.push('Bcc: ' + bcc);
  }

  mimeBase.push('Content-Type: multipart/mixed; boundary=' + boundary + nl);
  mimeBase.push(
    [
      '--' + boundary,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit' + nl,
      body
    ].join(nl)
  );

  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const mimeAttachment = [
        '--' + boundary,
        'Content-Type: ' + attachment.mimeType,
        'Content-Length: ' + attachment.size,
        'Content-Disposition: attachment; filename="' +
          attachment.filename +
          '"',
        'Content-Transfer-Encoding: base64' + nl,
        chunkSubstr(attachment.data, 76)
      ];

      mimeBase.push(mimeAttachment.join(nl));
    }
  }

  mimeBase.push('--' + boundary + '--');

  return mimeBase.join(nl);
};

export const getGoogleConfigs = async () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_PROJECT_ID,
    GOOGLE_GMAIL_TOPIC
  } = await getCommonGoogleConfigs();

  return {
    GOOGLE_PROJECT_ID,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_GMAIL_TOPIC
  };
};

export const gmailRequest = async ({
  url,
  accessToken,
  email,
  type,
  method,
  params = {},
  body
}: IGmailRequest) => {
  try {
    const account = await Accounts.findOne({ email }).lean();

    const response = await sendRequest({
      url: url || `${BASE_URL}/me/${type}/${params.id ? params.id : ''}`,
      body,
      method,
      params,
      headerParams: { Authorization: `Bearer ${accessToken || account.token}` }
    });

    return response;
  } catch (e) {
    debugError(
      `Failed: gmailRequest email: ${email} type: ${type} ${e.message}`
    );
    throw e;
  }
};

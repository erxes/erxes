import { debugGmail } from '../debuggers';
import { getOauthClient, gmailClient } from './auth';
import { ICredentials, IMailParams } from './types';
import { getCredentialsByEmailAccountId } from './util';

const encodeBase64 = (subject: string) => {
  return `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
};

/**
 * Create a MIME message that complies with RFC 2822
 * @see {https://tools.ietf.org/html/rfc2822}
 */
export const createMimeMessage = (mailParams: IMailParams): string => {
  const { bcc, cc, to, body, headerId, references, from, subject, attachments } = mailParams;

  const nl = '\n';
  const boundary = '__erxes__';

  const mimeBase = [
    'MIME-Version: 1.0',
    'To: ' + to, // "user1@email.com, user2@email.com"
    'From: <' + from + '>',
    'Subject: ' + encodeBase64(subject),
  ];

  // Reply
  if (references) {
    mimeBase.push('References:' + references);
  }

  if (headerId) {
    mimeBase.push(['In-Reply-To: ' + headerId, 'Message-ID: ' + headerId].join(nl));
  }

  if (cc && cc.length > 0) {
    mimeBase.push('Cc: ' + cc);
  }

  if (bcc && bcc.length > 0) {
    mimeBase.push('Bcc: ' + bcc);
  }

  mimeBase.push('Content-Type: multipart/mixed; boundary=' + boundary + nl);
  mimeBase.push(
    ['--' + boundary, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: 8bit' + nl, body].join(nl),
  );

  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const mimeAttachment = [
        '--' + boundary,
        'Content-Type: ' + attachment.mimeType,
        'Content-Length: ' + attachment.size,
        'Content-Disposition: attachment; filename="' + attachment.filename + '"',
        'Content-Transfer-Encoding: base64' + nl,
        chunkSubstr(attachment.data, 76),
      ];

      mimeBase.push(mimeAttachment.join(nl));
    }
  }

  mimeBase.push('--' + boundary + '--');

  return mimeBase.join(nl);
};

const chunkSubstr = (str: string, size: number) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

export const sendGmail = async (accountId: string, email: string, mailParams: IMailParams) => {
  const message = createMimeMessage(mailParams);
  const credentials = await getCredentialsByEmailAccountId({ email });

  const doc = { credentials, message, accountId, threadId: mailParams.threadId };

  return composeEmail(doc);
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

import { CONVERSATION_STATUSES } from '../data/constants';
import { publishClientMessage, publishMessage } from '../data/resolvers/mutations/conversations';
import { Accounts, ConversationMessages, Conversations, Customers, Integrations } from '../db/models';
import { IGmail as IMsgGmail } from '../db/models/definitions/conversationMessages';
import { IConversationDocument } from '../db/models/definitions/conversations';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { utils } from './gmailTracker';

interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface IMailParams {
  integrationId: string;
  cocType: string;
  cocId: string;
  subject: string;
  body: string;
  toEmails: string;
  cc?: string;
  bcc?: string;
  attachments?: IAttachmentParams[];
  references?: string;
  headerId?: string;
  threadId?: string;
  fromEmail?: string;
}

/**
 * Create string sequence that generates email body encrypted to base64
 */
const encodeEmail = async (params: IMailParams) => {
  const { toEmails, fromEmail, subject, body, attachments, cc, bcc, headerId, references } = params;

  // split header to add reply References
  let rawHeader = ['Content-Type: multipart/mixed; boundary="erxes"', 'MIME-Version: 1.0'].join('\r\n');

  // if message is reply add follow references
  if (headerId) {
    rawHeader += [`References: ${references}`, `In-Reply-To: ${headerId}`].join('\r\n');
  }

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  let rawEmail =
    rawHeader +
    [
      `From: ${fromEmail}`,
      `To: ${toEmails}`,
      `Cc: ${cc || ''}`,
      `Bcc: ${bcc || ''}`,
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
    for (const attach of attachments) {
      rawEmail += [
        '--erxes',
        `Content-Type: ${attach.mimeType}`,
        'MIME-Version: 1.0',
        `Content-Length: ${attach.size}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attach.filename}"`,
        '',
        attach.data,
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
export const sendGmail = async (mailParams: IMailParams) => {
  let totalSize = 0;
  // 10mb
  const limit = 1000000 * 10;
  if (mailParams.attachments) {
    for (const attach of mailParams.attachments) {
      totalSize += attach.size;

      if (attach.size > limit || totalSize > limit) {
        throw new Error(`${attach.filename} file size exceeded`);
      }
    }
  }

  const { integrationId, threadId } = mailParams;
  const integration = await Integrations.findOne({ _id: integrationId });

  if (!integration || !integration.gmailData) {
    throw new Error(`Integration not found id with ${integrationId}`);
  }

  const credentials = await Accounts.getGmailCredentials(integration.gmailData.email);

  const fromEmail = integration.gmailData.email;
  // get raw string encrypted by base64
  const raw = await encodeEmail({ fromEmail, ...mailParams });

  await utils.sendEmail(integration._id, credentials, raw, threadId);

  return { status: 200, statusText: 'ok ' };
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
    references: headers.references,
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
const getBodyProperties = (headers: any, part: any, gmailData: IMsgGmail) => {
  const isHtml = part.mimeType && part.mimeType.includes('text/html');
  const isPlain = part.mimeType && part.mimeType.includes('text/plain');
  const cd = headers['content-disposition'];
  const isAttachment = cd && cd.includes('attachment');
  const isInline = cd && cd.includes('inline');

  // get html content
  if (isHtml && !isAttachment) {
    gmailData.textHtml = Buffer.from(part.body.data, 'base64').toString();

    // get plain text
  } else if (isPlain && !isAttachment) {
    gmailData.textPlain = Buffer.from(part.body.data, 'base64').toString();

    // get attachments
  } else if (isAttachment || isInline) {
    const body = part.body;

    if (!gmailData.attachments) {
      gmailData.attachments = [];
    }

    gmailData.attachments.push({
      filename: part.filename,
      mimeType: part.mimeType,
      size: body.size,
      attachmentId: body.attachmentId,
    });
  }

  return gmailData;
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
  let gmailData: IMsgGmail = getHeaderProperties(headers, id, threadId, labelIds);

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

    gmailData = getBodyProperties(headers, part, gmailData);

    firstPartProcessed = true;
  }

  return gmailData;
};

/**
 * Get gmail inbox updates
 */
export const getGmailUpdates = async ({ emailAddress, historyId }: { emailAddress: string; historyId: string }) => {
  const integration = await Integrations.findOne({
    gmailData: { $exists: true },
    'gmailData.email': emailAddress,
  });

  if (!integration || !integration.gmailData) {
    throw new Error(`Integration not found gmailData with ${emailAddress}`);
  }

  const credentials = await Accounts.getGmailCredentials(emailAddress);

  const storedHistoryId = integration.gmailData.historyId;

  if (storedHistoryId) {
    await utils.getMessagesByHistoryId(storedHistoryId, integration._id, credentials);
  }

  integration.gmailData.historyId = historyId;

  await integration.save();
};

/**
 * Get or create customer for conversation
 */
export const getOrCreateCustomer = async (integrationId: string, email: string) => {
  let primaryEmail: string = email;
  let firstName: string = '';
  let lastName: string = '';

  if (email.includes(' ')) {
    const info = email.split(' ');

    for (const val of info) {
      if (val.includes('@')) {
        primaryEmail = val.replace('<', '').replace('>', '');
      } else if (!firstName) {
        firstName = val;
      } else {
        lastName = val;
      }
    }
  }

  const customer = await Customers.findOne({ emails: { $in: [primaryEmail] } });

  if (customer) {
    return customer;
  }

  return Customers.createCustomer({
    primaryEmail,
    firstName,
    lastName,
    emails: [primaryEmail],
    integrationId,
  });
};

/**
 * Create new message as recieved email
 */
export const createMessage = async ({
  conversation,
  content,
  customer,
  gmailData,
}: {
  conversation: IConversationDocument;
  content: string;
  customer: ICustomerDocument;
  gmailData: IMsgGmail;
}): Promise<string> => {
  if (!conversation) {
    throw new Error('createMessage: Conversation not found');
  }

  // create new message
  const message = await ConversationMessages.createMessage({
    conversationId: conversation._id,
    customerId: customer._id,
    content,
    gmailData,
    internal: false,
  });

  // notifying conversation inserted
  publishClientMessage(message);

  // notify subscription server new message
  publishMessage(message, conversation.customerId);

  return message._id;
};

/**
 * Create or update conversation defends on new email or reply email
 */
const getOrCreateConversation = async (
  integrationId: string,
  customerId: string,
  content: string,
  messageId: string,
  reply?: string,
) => {
  if (reply) {
    // new conversation
    const replyHeaders = reply.match(/\<\S+\>/gi);

    // check if message is reply save in one conversation
    const conversationMessage = await ConversationMessages.findOne({
      'gmailData.headerId': { $in: replyHeaders },
    }).sort({ createdAt: -1 });

    if (conversationMessage) {
      const conversation = await Conversations.findOne({ _id: conversationMessage.conversationId });

      if (conversation) {
        conversation.status = CONVERSATION_STATUSES.OPEN;
        conversation.content = content;
        conversation.readUserIds = [];
        await conversation.save();
        return conversation;
      }
    }
  }

  return Conversations.createConversation({
    integrationId,
    customerId,
    status: CONVERSATION_STATUSES.NEW,
    content,

    // save gmail infos
    gmailData: {
      messageId,
    },
  });
};

/*
 * Save google message to database
 */
export const syncConversation = async (integrationId: string, gmailData: IMsgGmail) => {
  const { subject, reply, from, messageId } = gmailData;

  if (!subject || !from || !messageId) {
    throw new Error('Empty gmail data');
  }

  // check if message exists
  const prevMessage = await ConversationMessages.findOne({
    'gmailData.messageId': messageId,
  });

  if (prevMessage) {
    return prevMessage;
  }

  // get customer
  const customer = await getOrCreateCustomer(integrationId, from);

  // get conversation
  const conversation = await getOrCreateConversation(integrationId, customer._id, subject, messageId, reply);

  // create new message
  return createMessage({
    conversation,
    customer,
    content: subject,
    gmailData: {
      messageId,
      ...gmailData,
    },
  });
};

/**
 * Get attachment as a base64 string from gmail.users.attachments.get with help conversation id and attachment id
 */
export const getAttachment = async (conversationMessageId: string, attachmentId: string) => {
  const message = await ConversationMessages.findOne({ _id: conversationMessageId });
  if (!message || !message.gmailData) {
    throw new Error(`Conversation message not found id with ${conversationMessageId}`);
  }

  const conversation = await Conversations.findOne({ _id: message.conversationId });

  if (!conversation) {
    throw new Error(`Conversation not found id with ${message.conversationId}`);
  }

  const integration = await Integrations.findOne({ _id: conversation.integrationId });

  if (!integration || !integration.gmailData) {
    throw new Error(`Integration gmail data not found id with ${conversation.integrationId}`);
  }

  const credentials = await Accounts.getGmailCredentials(integration.gmailData.email);

  return utils.getGmailAttachment(credentials, message.gmailData, attachmentId);
};

/*
 * Register new email to push notification
 */
export const updateHistoryId = async integration => {
  const credentials = await Accounts.getGmailCredentials(integration.gmailData.email);
  const { data } = await utils.callWatch(credentials, integration._id);

  integration.gmailData.historyId = data.historyId;
  integration.gmailData.expiration = data.expiration;

  await integration.save();
};

/*
 * refresh token and save when access_token expires
 */
export const refreshAccessToken = async (integrationId: string, tokens: any) => {
  const integration = await Integrations.findOne({ _id: integrationId });
  if (!integration || !integration.gmailData) {
    throw new Error(`Integration not found id with ${integrationId}`);
  }
  const account = await Accounts.findOne({ _id: integration.gmailData.accountId });
  if (!account) {
    throw new Error(`Account not found id with ${integration.gmailData.accountId}`);
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

import { debugNylas } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { sendRequest } from '../utils';
import { enableOrDisableAccount, getAttachment, sendMessage, uploadFile } from './api';
import {
  connectExchangeToNylas,
  connectImapToNylas,
  connectProviderToNylas,
  connectYahooAndOutlookToNylas,
} from './auth';
import { NYLAS_MODELS } from './store';
import { buildEmailAddress } from './utils';

export const createNylasIntegration = async (kind: string, accountId: string, integrationId: string) => {
  debugNylas(`Creating nylas integration kind: ${kind}`);

  const account = await Accounts.getAccount({ _id: accountId });

  try {
    await Integrations.create({
      kind,
      accountId,
      email: account.email,
      erxesApiId: integrationId,
    });

    // Connect provider to nylas ===========
    switch (kind) {
      case 'exchange':
        await connectExchangeToNylas(account);
        break;
      case 'imap':
        await connectImapToNylas(account);
        break;
      case 'outlook':
      case 'yahoo':
        await connectYahooAndOutlookToNylas(kind, account);
        break;
      default:
        await connectProviderToNylas(kind, account);
        break;
    }
  } catch (e) {
    await Integrations.deleteOne({ accountId, erxesApiId: integrationId });
    throw e;
  }

  const updatedAccount = await Accounts.getAccount({ _id: accountId });

  if (updatedAccount.billingState === 'cancelled') {
    await enableOrDisableAccount(updatedAccount.uid, true);
  }
};

export const getMessage = async (erxesApiMessageId: string, integrationId: string) => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found!');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  const conversationMessages = NYLAS_MODELS[account.kind].conversationMessages;

  const message = await conversationMessages.findOne({ erxesApiMessageId }).lean();

  if (!message) {
    throw new Error('Conversation message not found');
  }

  // attach account email for dinstinguish sender
  message.integrationEmail = account.email;

  return message;
};

export const nylasFileUpload = async (erxesApiId: string, response: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  if (!account) {
    throw new Error('Account not found');
  }

  const file = response.file || response.upload;

  try {
    const result = await uploadFile(file, account.nylasToken);

    return result;
  } catch (e) {
    throw e;
  }
};

export const nylasGetAttachment = async (attachmentId: string, integrationId: string) => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  if (!account) {
    throw new Error('Account not found');
  }

  const response: { body?: Buffer } = await getAttachment(attachmentId, account.nylasToken);

  if (!response) {
    throw new Error('Attachment not found');
  }

  return response;
};

export const nylasSendEmail = async (erxesApiId: string, params: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  if (!account) {
    throw new Error('Account not found');
  }

  try {
    const { shouldResolve, to, cc, bcc, body, threadId, subject, attachments, replyToMessageId } = params;

    const doc = {
      to: buildEmailAddress(to),
      cc: buildEmailAddress(cc),
      bcc: buildEmailAddress(bcc),
      subject: replyToMessageId && !subject.includes('Re:') ? `Re: ${subject}` : subject,
      body,
      threadId,
      files: attachments,
      replyToMessageId,
    };

    const message = await sendMessage(account.nylasToken, doc);

    debugNylas('Successfully sent message');

    if (shouldResolve) {
      debugNylas('Resolve this message ======');

      return 'success';
    }

    // Set mail to inbox
    await sendRequest({
      url: `https://api.nylas.com/messages/${message.id}`,
      method: 'PUT',
      headerParams: {
        Authorization: `Basic ${Buffer.from(`${account.nylasToken}:`).toString('base64')}`,
      },
      body: { unread: true },
    });

    return 'success';
  } catch (e) {
    debugNylas(`Failed to send message: ${e}`);

    throw e;
  }
};

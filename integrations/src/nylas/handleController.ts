import { debugNylas } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { Integrations } from '../models';
import { sendRequest } from '../utils';
import { getAttachment, sendMessage, uploadFile } from './api';
import {
  connectExchangeToNylas,
  connectImapToNylas,
  connectProviderToNylas,
  connectYahooAndOutlookToNylas,
} from './auth';
import { NYLAS_API_URL } from './constants';
import { NYLAS_MODELS } from './store';
import { INylasIntegrationData } from './types';
import { buildEmailAddress } from './utils';

export const createNylasIntegration = async (kind: string, integrationId: string, data: INylasIntegrationData) => {
  debugNylas(`Creating nylas integration kind: ${kind}`);

  try {
    if (data.email) {
      const integration = await Integrations.findOne({ email: data.email }).lean();

      if (integration) {
        throw new Error(`${data.email} already exists`);
      }
    }

    // Connect provider to nylas ===========
    switch (kind) {
      case 'exchange':
        await connectExchangeToNylas(integrationId, data);
        break;
      case 'imap':
        await connectImapToNylas(integrationId, data);
        break;
      case 'outlook':
      case 'yahoo':
        await connectYahooAndOutlookToNylas(kind, integrationId, data);
        break;
      default:
        await connectProviderToNylas(kind, integrationId, data.uid);
        break;
    }
  } catch (e) {
    throw e;
  }
};

export const getMessage = async (erxesApiMessageId: string, integrationId: string) => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found!');
  }

  const { email, kind } = integration;

  const conversationMessages = NYLAS_MODELS[kind].conversationMessages;

  const message = await conversationMessages.findOne({ erxesApiMessageId }).lean();

  if (!message) {
    throw new Error('Conversation message not found');
  }

  // attach account email for dinstinguish sender
  message.integrationEmail = email;

  return message;
};

export const nylasFileUpload = async (erxesApiId: string, response: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const file = response.file || response.upload;

  try {
    return uploadFile(file, integration.nylasToken);
  } catch (e) {
    throw e;
  }
};

export const nylasGetAttachment = async (attachmentId: string, integrationId: string) => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const response: { body?: Buffer } = await getAttachment(attachmentId, integration.nylasToken);

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

    const message = await sendMessage(integration.nylasToken, doc);

    if (!shouldResolve) {
      await memoryStorage().addToArray('nylas_unread_messageId', message.id);

      // Set mail to inbox
      await sendRequest({
        url: `${NYLAS_API_URL}/messages/${message.id}`,
        method: 'PUT',
        headerParams: {
          Authorization: `Basic ${Buffer.from(`${integration.nylasToken}:`).toString('base64')}`,
        },
        body: { unread: true },
      });

      await memoryStorage().removeFromArray('nylas_unread_messageId', message.id);
    }

    debugNylas('Successfully sent message');

    return 'success';
  } catch (e) {
    debugNylas(`Failed to send message: ${e.message}`);

    throw e;
  }
};

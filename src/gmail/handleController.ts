import { debugGmail } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { compose } from '../utils';
import { collectMessagesIds, getAttachment, getHistoryChanges, getMessageById, send, subscribeUser } from './api';
import { ConversationMessages } from './models';
import { storeConversation, storeConversationMessage, storeCustomer, updateLastChangesHistoryId } from './store';

export const createIntegration = async (accountId: string, email: string, integrationId: string) => {
  const account = await Accounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Account not found');
  }

  debugGmail(`Creating gmail integration for ${email}`);

  // Check exsting Integration
  const prevIntegration = await Integrations.findOne({ accountId }).lean();

  if (prevIntegration) {
    throw new Error(`Integration already exist with this email: ${email}`);
  }

  try {
    const response = await subscribeUser(email);

    await Integrations.create({
      kind: 'gmail',
      email,
      accountId,
      gmailHistoryId: response.historyId,
      expiration: response.expiration,
      erxesApiId: integrationId,
    });
  } catch (e) {
    debugGmail(`Error Google: Could not subscribe user ${email} to a topic`);
    throw e;
  }
};

export const sendEmail = async (erxesApiId: string, mailParams: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  if (!account) {
    throw new Error('Account not found');
  }

  const { email } = account;

  try {
    return send(email, { from: email, ...mailParams });
  } catch (e) {
    debugGmail('Error Google: Failed to send email');
    throw e;
  }
};

export const getMessage = async (erxesApiMessageId: string, integrationId: string) => {
  debugGmail(`Request to get gmailData with: ${erxesApiMessageId}`);

  if (!erxesApiMessageId) {
    throw new Error('Conversation message id not defined');
  }

  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();
  const conversationMessage = await ConversationMessages.findOne({ erxesApiMessageId }).lean();

  if (!conversationMessage) {
    throw new Error('Conversation message not found');
  }

  // attach account email for dinstinguish sender
  conversationMessage.integrationEmail = account.uid;

  return conversationMessage;
};

export const getGmailAttachment = async (messageId: string, attachmentId: string, integrationId: string) => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId }).lean();

  if (!integration) {
    throw new Error('Integration not found!');
  }

  const account = await Accounts.findOne({ _id: integration.accountId }).lean();

  if (!account) {
    throw new Error('Account not found!');
  }

  return getAttachment(account.email, messageId, attachmentId);
};

export const handleMessage = async ({ email, historyId }: { email: string; historyId: string }) => {
  debugGmail(`Executing: handleMessage email: ${email}`);

  try {
    const integration = await Integrations.findOne({ email }).lean();

    if (!integration) {
      throw new Error('Integration not found');
    }

    const parsedEmails = await compose(
      getMessageById,
      collectMessagesIds,
      getHistoryChanges,
    )({ email, historyId: integration.gmailHistoryId });

    // No changes made with recent historyId nothing to sync
    if (!parsedEmails) {
      return;
    }

    const { _id, erxesApiId } = integration;

    for (const emailObj of parsedEmails) {
      // Skip emails that sent from itself
      if (!emailObj.inReplyTo && emailObj.labelIds.indexOf('SENT') > -1) {
        continue;
      }

      await compose(
        storeConversationMessage,
        storeConversation,
        storeCustomer,
      )({ email: emailObj, integrationIds: { id: _id, erxesApiId } });
    }

    return updateLastChangesHistoryId(email, historyId);
  } catch (e) {
    debugGmail(`Failed: handleMessage email ${email}`);
    throw e;
  }
};

import { debugGmail } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { getAttachment } from './api';
import { ConversationMessages } from './models';
import { sendGmail } from './send';
import { getCredentialsByEmailAccountId } from './util';
import { watchPushNotification } from './watch';

export const createGmailIntegration = async (accountId: string, email: string, integrationId: string) => {
  const account = await Accounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Account not found');
  }

  debugGmail(`Creating gmail integration for ${email}`);

  // Check exsting Integration
  const dummyIntegration = await Integrations.findOne({ kind: 'gmail', accountId, email }).lean();

  if (dummyIntegration) {
    throw new Error(`Integration already exist with this email: ${email}`);
  }

  const integration = await Integrations.create({
    kind: 'gmail',
    accountId,
    erxesApiId: integrationId,
    email,
  });

  debugGmail(`Watch push notification for this ${email} user`);

  let historyId;
  let expiration;

  try {
    const response = await watchPushNotification(email);

    historyId = response.data.historyId;
    expiration = response.data.expiration;
  } catch (e) {
    debugGmail(`Error Google: Could not subscribe user ${email} to topic`);
    throw e;
  }

  integration.gmailHistoryId = historyId;
  integration.expiration = expiration;

  return integration.save();
};

export const sendEmail = async (erxesApiId: string, mailParams: any) => {
  const integration = await Integrations.findOne({ erxesApiId });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const account = await Accounts.findOne({ _id: integration.accountId });

  if (!account) {
    throw new Error('Account not found');
  }

  try {
    const { uid, _id } = account;
    const doc = { from: uid, ...mailParams };

    return sendGmail(_id, uid, doc);
  } catch (e) {
    debugGmail('Error Google: Failed to send email');
    throw e;
  }
};

export const getGmailMessage = async (erxesApiMessageId: string, integrationId: string) => {
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

  const credentials = await getCredentialsByEmailAccountId({ accountId: account._id });

  try {
    const attachment = await getAttachment(credentials, messageId, attachmentId);

    return attachment;
  } catch (e) {
    throw e;
  }
};

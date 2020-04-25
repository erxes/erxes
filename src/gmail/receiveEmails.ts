import { debugGmail } from '../debuggers';
import { Integrations } from '../models';
import { IIntegrationDocument } from '../models/Integrations';
import { getHistoryList, getOauthClient, sendBatchRequest, sendSingleRequest } from './api';
import { createOrGetConversation, createOrGetConversationMessage, createOrGetCustomer } from './store';
import { IMessage } from './types';
import { extractEmailFromString, getCredentialsByEmailAccountId, parseMessage } from './util';

/**
 * Get full message with historyId
 */
export const syncByHistoryId = async (accountId: string, startHistoryId: string) => {
  let response;

  try {
    const credentials = await getCredentialsByEmailAccountId({ accountId });

    const auth = await getOauthClient();

    auth.setCredentials(credentials);

    const data = await getHistoryList(auth, startHistoryId);

    if (!data) {
      return;
    }

    const { history = [] } = data;

    const receivedMessages = [];

    // Collection messages only history type is messagesAdded
    for (const item of history) {
      if (item.messagesAdded) {
        receivedMessages.push(...item.messagesAdded);
      }
    }

    if (receivedMessages.length === 0) {
      return debugGmail('No new messages found');
    }

    const singleMessage = receivedMessages.length === 1;

    // Send batch request for multiple messages
    response = {
      batchMessages: !singleMessage && (await sendBatchRequest(auth, receivedMessages)),
      singleMessage: singleMessage && (await sendSingleRequest(auth, receivedMessages)),
    };
  } catch (e) {
    debugGmail(`Error Google: Failed to syncronize gmail with given historyId ${e}`);
    throw e;
  }

  return response;
};

/**
 * Syncronize gmail with given historyId of mailbox
 */
export const syncPartially = async (receivedEmail: string, startHistoryId: string) => {
  const integration = await Integrations.findOne({ email: receivedEmail });

  if (!integration) {
    return new Error(`Integration not found in syncPartially`);
  }

  const { gmailHistoryId, accountId } = integration;

  debugGmail(`Sync partially gmail messages with ${gmailHistoryId}`);

  try {
    // Get batched multiple messages or single message
    const syncResponse = await syncByHistoryId(accountId, gmailHistoryId);

    if (!syncResponse) {
      return null;
    }

    const { batchMessages, singleMessage } = syncResponse;

    if (!batchMessages && !singleMessage) {
      return debugGmail(`Error Google: Could not get message with historyId in sync partially ${gmailHistoryId}`);
    }

    const messagesResponse = batchMessages ? batchMessages : [singleMessage.data];

    await processReceivedEmails(messagesResponse, integration, receivedEmail);

    // Update current historyId for future message
    integration.gmailHistoryId = startHistoryId;

    await integration.save();
  } catch (e) {
    debugGmail('Error occured while syncing emails');
    throw e;
  }
};

/**
 * Create customer, conversation, message
 * according to received emails
 */
const processReceivedEmails = async (
  messagesResponse: any,
  integration: IIntegrationDocument,
  receivedEmail: string,
) => {
  const [firstMessage] = messagesResponse;
  const previousMessageId = firstMessage.messageId;

  messagesResponse.forEach(async (value: IMessage, index: number) => {
    const updatedMessage = parseMessage(value);

    // prevent message duplication
    if (index > 0 && previousMessageId === updatedMessage.messageId) {
      return;
    }

    const { from, reply, messageId, subject, labelIds } = updatedMessage;

    // prevent to store emails by integration
    if (!reply && labelIds.indexOf('SENT') > -1) {
      return;
    }

    const email = extractEmailFromString(from);

    const integrationIds = {
      id: integration._id,
      erxesApiId: integration.erxesApiId,
    };

    // Customer ========
    const customer = await createOrGetCustomer(email, integrationIds);

    // Conversation =========
    const conversationDoc = {
      email,
      subject,
      receivedEmail,
      integrationIds,
      reply,
      customerErxesApiId: customer.erxesApiId,
    };

    const conversation = await createOrGetConversation(conversationDoc);

    // Conversation message ==========
    const conversationIds = {
      id: conversation._id,
      erxesApiId: conversation.erxesApiId,
    };

    const messageDoc = {
      messageId,
      conversationIds,
      message: updatedMessage,
      customerErxesApiId: customer.erxesApiId,
    };

    await createOrGetConversationMessage(messageDoc);
  });
};

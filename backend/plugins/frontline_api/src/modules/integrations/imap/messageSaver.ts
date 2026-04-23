import Imap from 'node-imap';
import { IModels } from '~/connectionResolvers';
import { IIntegrationImapDocument } from '@/integrations/imap/models';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  searchMessages,
  findOrCreateCustomer,
  findRelatedConversation,
} from './messageProcessor';

export const saveMessages = async (
  subdomain: string,
  imap: Imap,
  integration: IIntegrationImapDocument,
  criteria: any,
  models: IModels,
): Promise<void> => {
  const msgs: any[] = await searchMessages(imap, criteria);

  console.log(`[IMAP] Found ${msgs.length} messages to process`);

  for (const msg of msgs) {
    try {
      await saveMessage(subdomain, msg, integration, models);
    } catch (err) {
      console.error(
        `[IMAP] Failed to save message ${msg.messageId ?? '(unknown)'}:`,
        err,
      );
    }
  }
};

const saveMessage = async (
  subdomain: string,
  msg: any,
  integration: IIntegrationImapDocument,
  models: IModels,
): Promise<void> => {
  const recipientAddress = msg.to?.value?.[0]?.address;
  const acceptedAddresses = [integration.user, integration.mainUser].filter(
    Boolean,
  );
  if (recipientAddress && !acceptedAddresses.includes(recipientAddress)) {
    return;
  }

  const existing = await models.ImapMessages.findOne({
    messageId: msg.messageId,
  });
  if (existing) return;

  const senderAddress: string = msg.from?.value?.[0]?.address;
  if (!senderAddress) {
    console.warn('[IMAP] Skipping message with no from address');
    return;
  }
  const customerId = await findOrCreateCustomer(
    subdomain,
    senderAddress,
    integration.inboxId,
    models,
  );


  let conversationId = await findRelatedConversation(
    models,
    msg.messageId,
    msg.inReplyTo,
    msg.references,
  );

  if (!conversationId) {
    const existingConversation = await models.Conversations.findOne({
      integrationId: integration.inboxId,
      customerId,
      status: { $in: ['new', 'open'] },
    }).lean();

    if (existingConversation) {
      conversationId = String(existingConversation._id);
    }
  }

  if (!conversationId) {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        integrationId: integration.inboxId,
        customerId,
        createdAt: msg.date,
        content: msg.subject,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }
    conversationId = response.data._id;
  } else {
    await models.Conversations.reopen(conversationId);
    await models.Conversations.updateConversation(conversationId, {
      content: msg.subject,
      updatedAt: msg.date ?? new Date(),
    });
  }

  const conversationMessage = await models.ImapMessages.create({
    inboxIntegrationId: integration.inboxId,
    inboxConversationId: conversationId,
    createdAt: msg.date,
    messageId: msg.messageId,
    inReplyTo: msg.inReplyTo,
    references: msg.references,
    subject: msg.subject,
    body: msg.html ?? '',
    to: msg.to?.value ?? [],
    cc: msg.cc?.value ?? [],
    bcc: msg.bcc?.value ?? [],
    from: msg.from?.value ?? [],
    attachments: (msg.attachments ?? []).map(
      ({ filename, contentType, size }) => ({
        filename,
        type: contentType,
        size,
      }),
    ),
    type: 'INBOX',
  });

  await pConversationClientMessageInserted(subdomain, {
    _id: String(conversationMessage._id),
    content: msg.html ?? '',
    conversationId,
  });
};

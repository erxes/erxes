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
  const msgs: any = await searchMessages(imap, criteria);

  console.log(`======== found ${msgs.length} messages`);

  for (const msg of msgs) {
    if (
      msg.to &&
      msg.to.value &&
      msg.to.value[0] &&
      msg.to.value[0].address !== integration.user
    ) {
      continue;
    }

    const message = await models.ImapMessages.findOne({
      messageId: msg.messageId,
    });

    if (message) {
      continue;
    }

    const from = msg.from.value[0].address;
    const customerId = await findOrCreateCustomer(
      subdomain,
      from,
      integration.inboxId,
    );

    let conversationId = await findRelatedConversation(
      models,
      msg.messageId,
      msg.inReplyTo,
      msg.references,
    );

    if (!conversationId) {
      const data = {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          integrationId: integration.inboxId,
          customerId,
          createdAt: msg.date,
          content: msg.subject,
        }),
      };

      const apiConversationResponse = await receiveInboxMessage(
        subdomain,
        data,
      );
      if (apiConversationResponse.status === 'success') {
        conversationId = apiConversationResponse.data._id;
      } else {
        throw new Error(
          `Conversation creation failed: ${JSON.stringify(
            apiConversationResponse,
          )}`,
        );
      }
    }

    const conversationMessage = await models.ImapMessages.create({
      inboxIntegrationId: integration.inboxId,
      inboxConversationId: conversationId,
      createdAt: msg.date,
      messageId: msg.messageId,
      inReplyTo: msg.inReplyTo,
      references: msg.references,
      subject: msg.subject,
      body: msg.html,
      to: msg.to && msg.to.value,
      cc: msg.cc && msg.cc.value,
      bcc: msg.bcc && msg.bcc.value,
      from: msg.from && msg.from.value,
      attachments: msg.attachments.map(({ filename, contentType, size }) => ({
        filename,
        type: contentType,
        size,
      })),
      type: 'INBOX',
    });

    await pConversationClientMessageInserted(subdomain, {
      _id: String(conversationMessage._id),
      content: msg.html,
      conversationId,
    });
  }
};

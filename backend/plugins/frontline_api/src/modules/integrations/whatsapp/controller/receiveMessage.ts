import { graphqlPubsub } from 'erxes-api-shared/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { IWhatsappIntegrationDocument } from '@/integrations/whatsapp/@types/integrations';
import { IWhatsappIncomingMessage } from '@/integrations/whatsapp/@types/utils';
import { getOrCreateCustomer } from '@/integrations/whatsapp/controller/store';
import { IModels } from '~/connectionResolvers';

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IWhatsappIntegrationDocument,
  message: IWhatsappIncomingMessage,
  profileName?: string,
) => {
  const userId = message.from;
  const phoneNumberId = integration.phoneNumberId;
  const content = message.text?.body || '';
  const timestamp = message.timestamp
    ? new Date(Number(message.timestamp) * 1000)
    : new Date();

  if (!content) {
    return;
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    phoneNumberId,
    userId,
    profileName,
  );

  if (!customer.erxesApiId) {
    throw new Error('Customer was not synced');
  }

  let conversation = await models.WhatsappConversations.findOne({
    senderId: userId,
    recipientId: phoneNumberId,
  });

  let isNewConversation = false;

  if (!conversation) {
    isNewConversation = true;
    conversation = await models.WhatsappConversations.create({
      timestamp,
      senderId: userId,
      recipientId: phoneNumberId,
      content,
      integrationId: integration._id,
    });
  } else {
    conversation.content = content;
    await conversation.save();
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content,
        attachments: [],
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });

    if (response.status === 'success') {
      conversation.erxesApiId = response.data._id;
      await conversation.save();
    } else {
      throw new Error(response.errorMessage || 'Conversation creation failed');
    }
  } catch (e) {
    if (isNewConversation) {
      await models.WhatsappConversations.deleteOne({ _id: conversation._id });
    }
    throw e;
  }

  const existingMessage = await models.WhatsappConversationMessages.findOne({
    mid: message.id,
  });

  if (existingMessage) {
    return;
  }

  const created = await models.WhatsappConversationMessages.create({
    conversationId: conversation._id,
    mid: message.id,
    createdAt: timestamp,
    content,
    customerId: customer.erxesApiId,
    attachments: [],
  });

  const doc = {
    ...created.toObject(),
    conversationId: conversation.erxesApiId,
  };

  await pConversationClientMessageInserted(subdomain, doc);

  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversation.erxesApiId}`,
    {
      conversationMessageInserted: doc,
    },
  );
};

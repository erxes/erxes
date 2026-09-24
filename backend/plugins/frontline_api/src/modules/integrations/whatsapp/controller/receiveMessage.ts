import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugWhatsapp } from '@/integrations/whatsapp/debuggers';
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
    debugWhatsapp(
      `Dropping non-text whatsapp message type=${message.type} from=${message.from} id=${message.id}`,
    );
    return;
  }

  const existingMessage = await models.WhatsappConversationMessages.findOne({
    mid: message.id,
  });

  if (existingMessage) {
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

  let created;

  try {
    created = await models.WhatsappConversationMessages.create({
      conversationId: conversation._id,
      mid: message.id,
      createdAt: timestamp,
      content,
      customerId: customer.erxesApiId,
      attachments: [],
    });
  } catch (e) {
    if (e.code === 11000) {
      return;
    }
    throw e;
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content,
        createdAt: timestamp,
        attachments: [],
        customerId: customer.erxesApiId,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        response.errorMessage || 'Message sync to inbox failed',
      );
    }
  } catch (e) {
    await models.WhatsappConversationMessages.deleteOne({
      _id: created._id,
    });
    throw e;
  }
};

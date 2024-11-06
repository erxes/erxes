import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IMessageData } from './types';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { INTEGRATION_KINDS } from './constants';
import { uploadFileFromUrl } from './utils';

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  messageData: IMessageData
): Promise<void> => {
  const { metadata, contacts = [], messages = [] } = messageData;
  const { phone_number_id } = metadata;

  const waId = contacts.length > 0 ? contacts[0]?.wa_id : undefined;
  if (!waId) {
    console.error('No WhatsApp ID found in contacts');
    return;
  }

  try {
    const integration = await models.Integrations.findOne({
      $and: [
        { whatsappNumberIds: { $in: [phone_number_id] } },
        { kind: INTEGRATION_KINDS.MESSENGER }
      ]
    });

    if (!integration) {
      throw new Error('WhatsApp Integration not found');
    }

    const customer = await getOrCreateCustomer(
      models,
      subdomain,
      phone_number_id,
      INTEGRATION_KINDS.MESSENGER,
      contacts,
      integration
    );

    if (!customer) {
      throw new Error('Failed to get or create customer');
    }

    let conversation = await models.Conversations.findOne({
      senderId: phone_number_id,
      recipientId: waId
    });

    const messageId = messages.length > 0 ? messages[0]?.id : undefined;
    let attachments: { type: string; url: any }[] = [];
    const type = messages.length > 0 ? messages[0]?.type : undefined;

    const content =
      messages[0]?.text?.body || messages[0]?.image?.caption || '';
    if (
      ['image', 'video', 'sticker', 'document', 'audio'].includes(type || '')
    ) {
      const account = await models.Accounts.findOne({
        _id: integration.accountId
      });
      if (!account) {
        throw new Error('Account not found');
      }

      const mediaId = messages[0]?.[type as keyof IMessageData['message']]?.id;
      const mimeType =
        messages[0]?.[type as keyof IMessageData['message']]?.mime_type;

      if (mediaId && mimeType) {
        const uploadedMedia = await uploadFileFromUrl(
          mediaId,
          mimeType,
          subdomain,
          account.token
        );
        attachments.push({ type: mimeType, url: uploadedMedia });
      } else {
        console.error('Media ID or MIME type missing');
      }
    }

    const timestamp =
      messages.length > 0
        ? new Date(parseInt(messages[0]?.timestamp as string) * 1000)
        : new Date();

    if (!conversation) {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: phone_number_id,
        recipientId: waId,
        content,
        integrationId: integration._id
      });
    }

    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content,
          attachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp
        })
      },
      isRPC: true
    });

    conversation.erxesApiId = apiConversationResponse._id;
    await conversation.save();

    const conversationMessage = await models.ConversationMessages.findOne({
      mid: messageId
    });

    if (!conversationMessage) {
      const createdMessage = await models.ConversationMessages.create({
        mid: messageId,
        timestamp,
        senderId: phone_number_id,
        recipientId: waId,
        content,
        integrationId: integration._id,
        conversationId: conversation._id,
        createdAt: timestamp,
        customerId: customer.erxesApiId,
        attachments
      });

      await handleMessageUpdate(
        createdMessage.toObject(),
        conversation.erxesApiId,
        subdomain
      );
    }
  } catch (error) {
    throw new Error(`Error in receiveMessage: ${error.message}`);
  }
};

async function handleMessageUpdate(messageObject, conversationId, subdomain) {
  await sendInboxMessage({
    subdomain,
    action: 'conversationClientMessageInserted',
    data: { ...messageObject, conversationId }
  });

  graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: { ...messageObject, conversationId }
  });
}

export default receiveMessage;

import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IMessageData } from './types';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { INTEGRATION_KINDS } from './constants';

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  messageData: any
) => {
  // Destructuring values from messageData

  const { messaging_product, metadata, contacts, messages } = messageData;
  const { display_phone_number, phone_number_id } = metadata;

  // Extract WhatsApp ID from contacts
  const waId = contacts[0]?.wa_id; // Ensure contacts has data
  if (!waId) {
    throw new Error('WhatsApp ID not found in contacts');
  }

  // Find the WhatsApp integration
  const integration = await models.Integrations.findOne({
    $and: [
      { whatsappNumberIds: { $in: [phone_number_id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
  });

  // Check if integration exists
  if (!integration) {
    throw new Error('WhatsApp Integration not found');
  }

  // Get or create the customer based on the provided information
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    phone_number_id,
    INTEGRATION_KINDS.MESSENGER,
    contacts,
    integration
  );
  console.log(customer, 'akosdpaksopkadsop');
  if (!customer) {
    throw new Error('Failed to get or create customer');
  }

  // Check for existing conversation
  let conversation = await models.Conversations.findOne({
    senderId: phone_number_id,
    recipientId: waId
  });

  // Extract the text body from the incoming message
  const textBody = messages[0]?.text?.body; // Ensure messages has data
  const messageId = messages[0].id;
  if (!textBody) {
    throw new Error('Message text body not found');
  }

  // If no conversation exists, create a new one
  if (!conversation) {
    try {
      conversation = await models.Conversations.create({
        senderId: phone_number_id,
        recipientId: waId,
        content: textBody,
        integrationId: integration._id
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
      );
    }
  }

  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: textBody || '',
          attachments: [],
          conversationId: conversation.erxesApiId
        })
      },
      isRPC: true
    });
    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }
  const conversationMessage = await models.ConversationMessages.findOne({
    mid: messageId
  });
  console.log(messageId, 'messageId');
  if (!conversationMessage) {
    // save on integrations db
    try {
      const createdMessage = await models.ConversationMessages.create({
        mid: messageId,
        senderId: phone_number_id,
        recipientId: waId,
        content: textBody || '',
        integrationId: integration._id,
        conversationId: conversation._id,
        customerId: customer.erxesApiId,
        attachments: []
      });
      await handleMessageUpdate(
        createdMessage.toObject(),
        conversation.erxesApiId,
        subdomain
      );
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }
  }
};

async function handleMessageUpdate(messageObject, conversationId, subdomain) {
  // Send message to inbox
  await sendInboxMessage({
    subdomain,
    action: 'conversationClientMessageInserted',
    data: { ...messageObject, conversationId }
  });

  // Publish message to GraphQL
  graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: { ...messageObject, conversationId }
  });
}

export default receiveMessage;

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
  messageData: any
) => {
  console.log(messageData, 'messageData');
  const { metadata, contacts = [], messages = [] } = messageData;
  const { phone_number_id } = metadata;

  // Check for contacts
  const waId = contacts.length > 0 ? contacts[0]?.wa_id : undefined;

  // Fetch the WhatsApp integration
  const integration = await models.Integrations.findOne({
    $and: [
      { whatsappNumberIds: { $in: [phone_number_id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
  });

  if (!integration) {
    throw new Error('WhatsApp Integration not found');
  }

  // Get or create the customer based on contact details
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

  // Check for an existing conversation
  let conversation = await models.Conversations.findOne({
    senderId: phone_number_id,
    recipientId: waId
  });

  const messageId = messages.length > 0 ? messages[0]?.id : undefined;
  let content = '';
  let attachments: { type: string; url: any }[] = [];
  const type = messages.length > 0 ? messages[0]?.type : undefined;

  // Extract content based on message type
  if (type === 'text') {
    content = messages[0].text?.body || '';
  } else if (
    ['image', 'video', 'sticker', 'document', 'audio'].includes(type)
  ) {
    const account = await models.Accounts.findOne({
      _id: integration.accountId
    });
    if (!account) {
      throw new Error('Account not found');
    }

    const mediaId = messages[0][`${type}`]?.id;
    const mimeType = messages[0][`${type}`]?.mime_type;

    if (mediaId) {
      // Upload the media file and store the URL
      const uploadedMedia = await uploadFileFromUrl(
        mediaId,
        mimeType,
        subdomain,
        account.token
      );
      attachments.push({ type: mimeType, url: uploadedMedia });
    }
  }

  // Create a new conversation if it doesn't exist
  const timestamp =
    messages.length > 0
      ? new Date(parseInt(messages[0]?.timestamp) * 1000)
      : new Date();

  if (!conversation) {
    try {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: phone_number_id,
        recipientId: waId,
        content,
        integrationId: integration._id
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e.message
      );
    }
  }

  // Send message data to the inbox
  try {
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
  } catch (e) {
    // Cleanup conversation if sending fails
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e.message);
  }

  // Check for an existing conversation message
  const conversationMessage = await models.ConversationMessages.findOne({
    mid: messageId
  });

  if (!conversationMessage) {
    try {
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

      // Handle message update
      await handleMessageUpdate(
        createdMessage.toObject(),
        conversation.erxesApiId,
        subdomain
      );
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e.message
      );
    }
  }
};

// const receiveMessage = async (
//   models: IModels,
//   subdomain: string,
//   messageData: any
// ) => {
//   const { messaging_product, metadata, contacts, messages } = messageData;
//   const { display_phone_number, phone_number_id } = metadata;
//   const waId = contacts[0]?.wa_id;
//   if (!waId) throw new Error('WhatsApp ID not found in contacts');
//   // console.log(messageData, 'kodpasodakspod');
//   const integration = await models.Integrations.findOne({
//     $and: [
//       { whatsappNumberIds: { $in: [phone_number_id] } },
//       { kind: INTEGRATION_KINDS.MESSENGER }
//     ]
//   });

//   if (!integration) {
//     throw new Error('WhatsApp Integration not found ');
//   }
//   const customer = await getOrCreateCustomer(
//     models,
//     subdomain,
//     phone_number_id,
//     INTEGRATION_KINDS.MESSENGER,
//     contacts,
//     integration
//   );

//   if (!customer) throw new Error('Failed to get or create customer');

//   let conversation = await models.Conversations.findOne({
//     senderId: phone_number_id,
//     recipientId: waId
//   });

//   const messageId = messages[0].id;
//   let content = '';
//   let attachments: { type: string; url: any }[] = [];

//   const type = messages[0].type;

//   if (messages[0].type === 'text') {
//     content = messages[0].text?.body || '';
//   } else if (
//     type === 'image' ||
//     type === 'video' ||
//     type === 'sticker' ||
//     type === 'document' ||
//     type === 'audio'
//   ) {
//     const account = await models.Accounts.findOne({
//       _id: integration.accountId
//     });
//     if (!account) {
//       throw new Error('Account not found');
//     }

//     const mediaId =
//       messages[0].image?.id ||
//       messages[0].video?.id ||
//       messages[0].sticker?.id ||
//       messages[0].document?.id ||
//       messages[0].audio?.id;
//     const mimeType =
//       messages[0].image?.mime_type ||
//       messages[0].video?.mime_type ||
//       messages[0].sticker?.mime_type ||
//       messages[0].document?.mime_type ||
//       messages[0].audio?.mime_type;

//     if (mediaId) {
//       // Upload the media file (image, video, sticker, or document)
//       const uploadedMedia = await uploadFileFromUrl(
//         mediaId,
//         mimeType,
//         subdomain,
//         account.token
//       );
//       attachments.push({ type: mimeType, url: uploadedMedia });
//     }
//   }
//   const timestamp = new Date(parseInt(messages[0].timestamp) * 1000); // Convert to milliseconds
//   if (!conversation) {
//     try {
//       conversation = await models.Conversations.create({
//         timestamp,
//         senderId: phone_number_id,
//         recipientId: waId,
//         content,
//         integrationId: integration._id
//       });
//     } catch (e) {
//       throw new Error(
//         e.message.includes('duplicate')
//           ? 'Concurrent request: conversation duplication'
//           : e
//       );
//     }
//   }

//   try {
//     const apiConversationResponse = await sendInboxMessage({
//       subdomain,
//       action: 'integrations.receive',
//       data: {
//         action: 'create-or-update-conversation',
//         payload: JSON.stringify({
//           customerId: customer.erxesApiId,
//           integrationId: integration.erxesApiId,
//           content,
//           attachments,
//           conversationId: conversation.erxesApiId,
//           updatedAt: timestamp
//         })
//       },
//       isRPC: true
//     });

//     conversation.erxesApiId = apiConversationResponse._id;
//     await conversation.save();
//   } catch (e) {
//     await models.Conversations.deleteOne({ _id: conversation._id });
//     throw new Error(e);
//   }

//   const conversationMessage = await models.ConversationMessages.findOne({
//     mid: messageId
//   });

//   if (!conversationMessage) {
//     try {
//       const createdMessage = await models.ConversationMessages.create({
//         mid: messageId,
//         timestamp,
//         senderId: phone_number_id,
//         recipientId: waId,
//         content,
//         integrationId: integration._id,
//         conversationId: conversation._id,
//         createdAt: timestamp,
//         customerId: customer.erxesApiId,
//         attachments
//       });

//       await handleMessageUpdate(
//         createdMessage.toObject(),
//         conversation.erxesApiId,
//         subdomain
//       );
//     } catch (e) {
//       throw new Error(
//         e.message.includes('duplicate')
//           ? 'Concurrent request: conversation message duplication'
//           : e
//       );
//     }
//   }
// };

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

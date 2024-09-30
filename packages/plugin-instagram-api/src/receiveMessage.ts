import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IMessageData } from './types';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { INTEGRATION_KINDS } from './constants';

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  messageData: IMessageData
) => {
  const { recipient, sender, timestamp, message } = messageData;
  // const attachments = messageData.message.attachments;
  const integration = await models.Integrations.findOne({
    $and: [
      { instagramPageId: { $in: [recipient.id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
  });

  if (!integration) {
    throw new Error('Instagram Integration not found ');
  }
  const userId = sender.id;
  const pageId = recipient.id;
  const { text, attachments } = message;
  // get or create customer

  const { facebookPageTokensMap, facebookPageId } = integration;
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    facebookPageId,
    INTEGRATION_KINDS.MESSENGER,
    facebookPageTokensMap
  );
  if (!customer) {
    throw new Error('Failed to get or create customer');
  }
  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  // create conversation
  if (!conversation) {
    // save on integrations db
    try {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
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

  const formattedAttachments = (attachments || [])
    .filter((att) => att.type !== 'fallback')
    .map((att) => ({
      type: att.type,
      url: att.payload ? att.payload.url : ''
    }));

  // save on api
  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: formattedAttachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp
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
  // get conversation message
  const conversationMessage = await models.ConversationMessages.findOne({
    mid: message.mid
  });

  if (!conversationMessage) {
    // save on integrations db
    try {
      const createdMessage = await models.ConversationMessages.create({
        mid: message.mid,
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
        integrationId: integration._id,
        conversationId: conversation._id,
        createdAt: timestamp,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments
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
  } else if (message.is_deleted) {
    // Update message content if deleted
    const updatedMessage = await models.ConversationMessages.findOneAndUpdate(
      { mid: message.mid },
      { $set: { content: 'This user has deleted this message' } },
      { new: true }
    );
    if (updatedMessage) {
      // Use the new function
      await handleMessageUpdate(
        updatedMessage.toObject(),
        conversation.erxesApiId,
        subdomain
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

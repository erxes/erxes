import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IMessageData } from './types';
import { graphqlPubsub } from './configs';
import { INTEGRATION_KINDS } from './constants';

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  messageData: IMessageData
) => {
  const { recipient, sender, timestamp, message } = messageData;
  // const attachments = messageData.message.attachments;
  const integration = await models.Integrations.getIntegration({
    $and: [
      { instagramPageId: { $in: [recipient.id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
  });
  const { facebookPageTokensMap, facebookPageId } = integration;

  const userId = sender.id;
  const pageId = recipient.id;
  const { text, attachments } = message;
  // get or create customer
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    facebookPageId,
    facebookPageTokensMap
  );

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
    .filter(att => att.type !== 'fallback')
    .map(att => ({
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
      const created = await models.ConversationMessages.create({
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

      // // save message on api
      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });

      graphqlPubsub.publish('conversationMessageInserted', {
        conversationMessageInserted: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }
  }
};

export default receiveMessage;

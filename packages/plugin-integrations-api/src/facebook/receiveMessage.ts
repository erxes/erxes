import { Activity } from 'botbuilder';
import { sendRPCMessage } from '../messageBroker';
import Integrations from '../models/Integrations';
import { ConversationMessages, Conversations } from './models';
import { getOrCreateCustomer } from './store';
import { IChannelData } from './types';

const receiveMessage = async (activity: Activity) => {
  const {
    recipient,
    sender,
    timestamp,
    text,
    attachments,
    message
  } = activity.channelData as IChannelData;

  const integration = await Integrations.getIntegration({
    $and: [
      { facebookPageIds: { $in: [recipient.id] } },
      { kind: 'facebook-messenger' }
    ]
  });

  const userId = sender.id;
  const pageId = recipient.id;
  const kind = 'facebook-messenger';

  // get or create customer
  const customer = await getOrCreateCustomer(pageId, userId, kind);

  // get conversation
  let conversation = await Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  // create conversation
  if (!conversation) {
    // save on integrations db
    try {
      conversation = await Conversations.create({
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

    // save on api
    try {
      const apiConversationResponse = await sendRPCMessage({
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: (attachments || [])
            .filter(att => att.type !== 'fallback')
            .map(att => ({
              type: att.type,
              url: att.payload ? att.payload.url : ''
            }))
        })
      });

      conversation.erxesApiId = apiConversationResponse._id;

      await conversation.save();
    } catch (e) {
      await Conversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }
  }

  // get conversation message
  const conversationMessage = await ConversationMessages.findOne({
    mid: message.mid
  });

  if (!conversationMessage) {
    // save on integrations db
    try {
      await ConversationMessages.create({
        conversationId: conversation._id,
        mid: message.mid,
        timestamp,
        content: text
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }

    // save message on api
    try {
      await sendRPCMessage({
        action: 'create-conversation-message',
        metaInfo: 'replaceContent',
        payload: JSON.stringify({
          content: text || '',
          attachments: (attachments || [])
            .filter(att => att.type !== 'fallback')
            .map(att => ({
              type: att.type,
              url: att.payload ? att.payload.url : ''
            })),
          conversationId: conversation.erxesApiId,
          customerId: customer.erxesApiId
        })
      });
    } catch (e) {
      await ConversationMessages.deleteOne({ mid: message.mid });
      throw new Error(e);
    }
  }
};

export default receiveMessage;

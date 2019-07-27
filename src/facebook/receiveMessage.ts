import { Activity } from 'botbuilder';
import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import Integrations from '../models/Integrations';
import { fetchMainApi } from '../utils';
import { ConversationMessages, Conversations, Customers } from './models';

interface IChannelData {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: { url: string };
  }>;
  message: {
    mid: string;
  };
}

const receiveMessage = async (adapter: FacebookAdapter, activity: Activity) => {
  const { recipient, sender, timestamp, text, attachments, message } = activity.channelData as IChannelData;
  const integration = await Integrations.findOne({ facebookPageIds: { $in: [recipient.id] } });

  if (!integration) {
    return;
  }

  const userId = sender.id;

  // get customer
  let customer = await Customers.findOne({ userId });

  // create customer
  if (!customer) {
    const api = await adapter.getAPI(activity);
    const response = await api.callAPI(`/${userId}`, 'GET', {});

    // save on integrations db
    try {
      customer = await Customers.create({
        userId,
        firstName: response.first_name,
        lastName: response.last_name,
        profilePic: response.profile_pic,
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? 'Concurrent request: customer duplication' : e);
    }

    // save on api
    try {
      const apiCustomerResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-customer',
          payload: JSON.stringify({
            integrationId: integration.erxesApiId,
            firstName: response.first_name,
            lastName: response.last_name,
            avatar: response.profile_pic,
          }),
        },
      });

      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }

  // get conversation
  let conversation = await Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id,
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
      });
    } catch (e) {
      throw new Error(e.message.includes('duplicate') ? 'Concurrent request: conversation duplication' : e);
    }

    // save on api
    try {
      const apiConversationResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation',
          payload: JSON.stringify({
            customerId: customer.erxesApiId,
            integrationId: integration.erxesApiId,
            content: text,
          }),
        },
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
    mid: message.mid,
  });

  if (!conversationMessage) {
    // save on integrations db
    await ConversationMessages.create({
      conversationId: conversation._id,
      mid: message.mid,
      timestamp,
      content: text,
    });

    // save message on api
    try {
      await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation-message',
          payload: JSON.stringify({
            content: text,
            attachments: (attachments || [])
              .filter(att => att.type !== 'fallback')
              .map(att => ({
                type: att.type,
                url: att.payload ? att.payload.url : '',
              })),
            conversationId: conversation.erxesApiId,
            customerId: customer.erxesApiId,
          }),
        },
      });
    } catch (e) {
      await ConversationMessages.deleteOne({ mid: message.mid });
      throw new Error(e);
    }
  }
};

export default receiveMessage;

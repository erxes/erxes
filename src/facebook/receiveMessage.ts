import { Activity } from 'botbuilder';
import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import Integrations from '../models/Integrations';
import { fetchMainApi } from '../utils';
import { Conversations, Customers } from './models';

interface IChannelData {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  text?: string;
  attachments?: Array<{
    type: string;
    payload: { url: string };
  }>;
}

const receiveMessage = async (adapter: FacebookAdapter, activity: Activity) => {
  const { recipient, sender, timestamp, text, attachments } = activity.channelData as IChannelData;
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

    // save on api
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

    // save on integrations db
    customer = await Customers.create({
      userId,
      erxesApiId: apiCustomerResponse._id,
      firstName: response.first_name,
      lastName: response.last_name,
      profilePic: response.profile_pic,
    });
  }

  // get conversation
  let conversation = await Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id,
  });

  // create conversation
  if (!conversation) {
    // save on api
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

    // save on integrations db
    conversation = await Conversations.create({
      erxesApiId: apiConversationResponse._id,
      timestamp,
      senderId: userId,
      recipientId: recipient.id,
      content: text,
    });
  }

  // save message on api
  await fetchMainApi({
    path: '/integrations-api',
    method: 'POST',
    body: {
      action: 'create-conversation-message',
      payload: JSON.stringify({
        content: text,
        attachments: (attachments || []).map(attachment => ({
          type: attachment.type,
          url: attachment.payload ? attachment.payload.url : '',
        })),
        conversationId: conversation.erxesApiId,
        customerId: customer.erxesApiId,
      }),
    },
  });
};

export default receiveMessage;

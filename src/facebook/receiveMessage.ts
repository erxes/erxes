import { Activity } from 'botbuilder';
import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import Integrations from '../models/Integrations';
import { fetchMainApi } from '../utils';
import { Conversations, Customers } from './models';

const receiveMessage = async (adapter: FacebookAdapter, message: Activity) => {
  const integration = await Integrations.findOne({ facebookPageIds: { $in: [message.recipient.id] } });

  if (!integration) {
    return;
  }

  const userId = message.from.id;

  // get customer
  let customer = await Customers.findOne({ userId });

  // create customer
  if (!customer) {
    const api = await adapter.getAPI(message);
    const response = await api.callAPI(`/${userId}`, 'GET', {});

    // save on api
    const apiCustomerResponse = await fetchMainApi({
      path: '/integrations-api',
      method: 'POST',
      body: {
        action: 'create-customer',
        payload: JSON.stringify({
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
    recipientId: message.recipient.id,
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
          content: message.text,
        }),
      },
    });

    // save on integrations db
    conversation = await Conversations.create({
      erxesApiId: apiConversationResponse._id,
      timestamp: message.timestamp,
      senderId: userId,
      recipientId: message.recipient.id,
      content: message.text,
    });
  }

  // save message on api
  await fetchMainApi({
    path: '/integrations-api',
    method: 'POST',
    body: {
      action: 'create-conversation-message',
      payload: JSON.stringify({
        content: message.text,
        conversationId: conversation.erxesApiId,
        customerId: customer.erxesApiId,
      }),
    },
  });
};

export default receiveMessage;

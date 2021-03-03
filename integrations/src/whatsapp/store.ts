import { ConversationMessages, Conversations, Customers } from './models';

import { debugError } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models';

export interface IUser {
  id: string;
  created_timestamp: string;
  name: string;
  screen_name: string;
  profile_image_url: string;
  profile_image_url_https: string;
}

export const getOrCreateCustomer = async (
  phoneNumber: string,
  name: string,
  instanceId: string
) => {
  const integration = await Integrations.getIntegration({
    $and: [{ whatsappinstanceId: instanceId }, { kind: 'whatsapp' }]
  });

  let customer = await Customers.findOne({ phoneNumber });
  if (customer) {
    return customer;
  }

  customer = await Customers.create({
    phoneNumber,
    name,
    integrationId: integration.id
  });

  // save on api
  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: name,
        phones: [phoneNumber],
        primaryPhone: phoneNumber,
        isUser: true
      })
    });

    customer.erxesApiId = apiCustomerResponse._id;

    await customer.save();
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
    throw e;
  }

  return customer;
};

export const createOrUpdateConversation = async (
  message,
  instanceId: string,
  customerIds,
  integrationIds
) => {
  const { customerId, customerErxesApiID } = customerIds;

  const { integrationId, integrationErxesApiId } = integrationIds;

  let conversation = await Conversations.findOne({
    senderId: customerId,
    instanceId
  });

  if (conversation) {
    return conversation;
  }

  conversation = await Conversations.create({
    timestamp: new Date(),
    senderId: customerId,
    recipientId: message.chatId,
    content: message.body,
    integrationId,
    instanceId
  });

  // save on api
  try {
    const apiConversationResponse = await sendRPCMessage({
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customerErxesApiID,
        integrationId: integrationErxesApiId,
        content: message.body
      })
    });

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await Conversations.deleteOne({ _id: conversation._id });

    debugError(
      `Error ocurred while trying to create or update conversation ${e.message}`
    );

    throw e;
  }

  return conversation;
};

export const createMessage = async (message, conversationIds) => {
  const {
    conversationId,
    conversationErxesApiId,
    customerErxesApiId
  } = conversationIds;

  const conversationMessage = await ConversationMessages.findOne({
    mid: message.id
  });

  if (conversationMessage) {
    return conversationMessage;
  }

  await ConversationMessages.create({
    conversationId,
    mid: message.id,
    timestamp: new Date(),
    content: message.body
  });

  let attachments = [];

  if (message.type !== 'chat') {
    attachments = [{ type: message.type, url: message.body }];
    message.body = '';
  }

  if (message.caption) {
    message.body = message.caption;
  }

  if (message.quotedMsgBody) {
    message.body = message.quotedMsgBody;
  }

  try {
    await sendRPCMessage({
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        content: message.body,
        attachments,
        conversationId: conversationErxesApiId,
        customerId: customerErxesApiId
      })
    });
  } catch (e) {
    await ConversationMessages.deleteOne({ mid: message.id });
    throw new Error(e);
  }

  return conversationMessage;
};

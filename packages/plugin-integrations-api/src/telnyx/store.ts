import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models/index';
import { SMS_DELIVERY_STATUSES, SMS_DIRECTIONS } from './constants';
import { ConversationMessages, Conversations, Customers } from './models';

interface IMessageParams {
  content: string;
  from: string;
  to: string;
  payload?: string;
}

const getOrCreateCustomer = async ({ from, to }: IMessageParams) => {
  const integration = await Integrations.getIntegration({
    telnyxPhoneNumber: to,
    kind: 'telnyx'
  });

  const args = {
    phoneNumber: from,
    integrationId: integration._id
  };

  let customer = await Customers.findOne(args);

  if (customer) {
    return customer;
  }

  customer = await Customers.create(args);

  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        primaryPhone: from,
        phoneValidationStatus: 'valid'
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

const getOrCreateConversation = async ({
  content,
  to,
  from
}: IMessageParams) => {
  const integration = await Integrations.getIntegration({
    telnyxPhoneNumber: to,
    kind: 'telnyx'
  });

  const customer = await getOrCreateCustomer({ from, to, content });

  const args = {
    integrationId: integration._id,
    from,
    to,
    customerId: customer._id
  };

  let conversation = await Conversations.findOne(args);

  if (conversation) {
    return conversation;
  }

  conversation = await Conversations.create(args);

  try {
    const response = await sendRPCMessage({
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        content,
        integrationId: integration.erxesApiId,
        customerId: customer.erxesApiId
      })
    });

    conversation.erxesApiId = response._id;

    await conversation.save();
  } catch (e) {
    await Conversations.deleteOne({ _id: conversation._id });
    throw e;
  }

  return conversation;
};

const createConversationMessage = async ({
  content,
  to,
  from,
  payload
}: IMessageParams) => {
  const conversation = await getOrCreateConversation({ content, to, from });

  const args = {
    from,
    to,
    direction: SMS_DIRECTIONS.INBOUND,
    conversationId: conversation._id,
    content,
    responseData: JSON.stringify(payload),
    status: SMS_DELIVERY_STATUSES.WEBHOOK_DELIVERED
  };

  const conversationMessage = await ConversationMessages.create(args);

  try {
    const response = await sendRPCMessage({
      action: 'create-conversation-message',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content
      })
    });

    conversationMessage.erxesApiId = response._id;

    await conversationMessage.save();
  } catch (e) {
    await ConversationMessages.deleteOne({ _id: conversationMessage._id });
    throw e;
  }
};

/**
 * Sends incoming sms to erxes-api to create conversation.
 * There are 2 situations.
 * 1. Sms from erxes has been sent to a specific phone number first.
 * 2. No sms has been sent before. The user is initiating the conversation.
 * @param data Telnyx data
 */
export const relayIncomingMessage = async (data: any) => {
  if (data && data.payload) {
    const { direction, from, text, to = [] } = data.payload;

    if (direction === SMS_DIRECTIONS.INBOUND) {
      for (const receiver of to) {
        await createConversationMessage({
          from: from.phone_number,
          to: receiver.phone_number,
          content: text,
          payload: data.payload
        });
      }
    } // end direction checking
  } // end data.payload checking
};

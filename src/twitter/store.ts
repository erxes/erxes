import { sendRPCMessage } from '../messageBroker';
import { IIntegrationDocument } from '../models/Integrations';
import { ConversationMessages, Conversations, Customers, IConversationDocument } from './models';

export interface IUser {
  id: string;
  created_timestamp: string;
  name: string;
  screen_name: string;
  protected: boolean;
  verified: boolean;
  followers_count: number;
  friends_count: number;
  statuses_count: number;
  profile_image_url: string;
  profile_image_url_https: string;
}

export const getOrCreateCustomer = async (integration: IIntegrationDocument, userId: string, receiver: IUser) => {
  let customer = await Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // save on integrations db
  try {
    customer = await Customers.create({
      userId: receiver.id,
      // not integrationId on erxes-api !!
      integrationId: integration._id,
      profilePic: receiver.profile_image_url_https,
      name: receiver.name,
      screenName: receiver.screen_name,
    });
  } catch (e) {
    throw new Error(e.message.includes('duplicate') ? 'Concurrent request: customer duplication' : e);
  }

  // save on api
  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        //  integrationId on erxes-api
        integrationId: integration.erxesApiId,
        firstName: receiver.screen_name,
        avatar: receiver.profile_image_url_https,
        isUser: true,
      }),
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};

export const getOrCreateConversation = async (
  senderId: string,
  receiverId: string,
  integrationId: string,
  content: string,
  customerErxesApiId: string,
  integrationErxesApiId: string,
) => {
  let conversation = await Conversations.findOne({
    senderId,
    receiverId,
  });

  if (conversation) {
    return conversation;
  }

  // create conversation

  // save on integrations db
  try {
    conversation = await Conversations.create({
      senderId,
      receiverId,
      content,
      integrationId,
    });
  } catch (e) {
    throw new Error(e.message.includes('duplicate') ? 'Concurrent request: conversation duplication' : e);
  }

  // save on api
  try {
    const apiConversationResponse = await sendRPCMessage({
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customerErxesApiId,
        integrationId: integrationErxesApiId,
        content,
      }),
    });

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }

  return conversation;
};

export const createConverstaionMessage = async (
  event: any,
  content: string,
  attachments: any[],
  customerErxesApiId: string,
  conversation: IConversationDocument,
) => {
  const { id, created_timestamp } = event;
  const conversationMessage = await ConversationMessages.findOne({
    messageId: id,
  });

  if (!conversationMessage) {
    // save on integrations db
    await ConversationMessages.create({
      conversationId: conversation._id,
      messageId: id,
      timestamp: created_timestamp,
      content,
    });

    // save message on api
    try {
      await sendRPCMessage({
        action: 'create-conversation-message',
        metaInfo: 'replaceContent',
        payload: JSON.stringify({
          content,
          conversationId: conversation.erxesApiId,
          customerId: customerErxesApiId,
          attachments,
        }),
      });
    } catch (e) {
      await ConversationMessages.deleteOne({ messageId: id });
      throw new Error(e);
    }
  }
};

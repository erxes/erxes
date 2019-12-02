import { Accounts, Integrations } from '../models';
import { fetchMainApi } from '../utils';
import { ConversationMessages, Conversations } from './models';
import { getOrCreateCustomer, IUser } from './store';

export interface IUsers {
  [key: string]: IUser;
}

const extractUrlFromAttachment = attachment => {
  if (!attachment) {
    return null;
  }

  const { media } = attachment;
  const { type } = media;

  if (type === 'animated_gif') {
    const { video_info } = media;

    const { variants } = video_info;

    return { url: variants[0].url, type: 'video/mp4' };
  }

  return null;
};

const receiveDms = async requestBody => {
  const { direct_message_events } = requestBody;

  const users: IUsers = requestBody.users;

  if (!direct_message_events) {
    return true;
  }

  for (const event of direct_message_events) {
    const { type, message_create, id, created_timestamp } = event;

    const senderId = message_create.sender_id;
    const receiverId = message_create.target.recipient_id;

    if (type === 'message_create') {
      const { message_data } = message_create;
      const { attachment } = message_data;

      const attachments = [];

      if (attachment) {
        attachments.push({ ...extractUrlFromAttachment(attachment) });
      }

      const account = await Accounts.findOne({ uid: receiverId });

      if (!account) {
        return;
      }

      const integration = await Integrations.getIntegration({
        $and: [{ accountId: account._id }, { kind: 'twitter-dm' }],
      });

      const customer = await getOrCreateCustomer(integration, senderId, users[senderId]);

      // get conversation
      let conversation = await Conversations.findOne({
        senderId,
        receiverId,
      });

      // create conversation
      if (!conversation) {
        // save on integrations db
        try {
          conversation = await Conversations.create({
            senderId,
            receiverId,
            content: message_data.text,
            integrationId: integration._id,
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
              action: 'create-or-update-conversation',
              payload: JSON.stringify({
                customerId: customer.erxesApiId,
                integrationId: integration.erxesApiId,
                content: message_data.text,
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
        messageId: id,
      });

      if (!conversationMessage) {
        // save on integrations db
        await ConversationMessages.create({
          conversationId: conversation._id,
          messageId: id,
          timestamp: created_timestamp,
          content: message_data.text,
        });

        // save message on api
        try {
          await fetchMainApi({
            path: '/integrations-api',
            method: 'POST',
            body: {
              action: 'create-conversation-message',
              metaInfo: 'replaceContent',
              payload: JSON.stringify({
                content: message_data.text,
                conversationId: conversation.erxesApiId,
                customerId: customer.erxesApiId,
                attachments,
              }),
            },
          });
        } catch (e) {
          await ConversationMessages.deleteOne({ messageId: id });
          throw new Error(e);
        }
      }
    }
  }
};

export default receiveDms;

import { Accounts, Integrations } from '../models';
import {
  createConverstaionMessage,
  getOrCreateConversation,
  getOrCreateCustomer,
  IUser
} from './store';

export interface IUsers {
  [key: string]: IUser;
}

const extractUrlFromAttachment = attachment => {
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
    const { type, message_create } = event;

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
        $and: [{ accountId: account._id }, { kind: 'twitter-dm' }]
      });

      const customer = await getOrCreateCustomer(
        integration,
        senderId,
        users[senderId]
      );

      const content = message_data.text;
      const customerErxesApiId = customer.erxesApiId;

      const conversation = await getOrCreateConversation(
        senderId,
        receiverId,
        integration._id,
        content,
        customerErxesApiId,
        integration.erxesApiId
      );

      await createConverstaionMessage(
        event,
        content,
        attachments,
        customerErxesApiId,
        conversation
      );
    }
  }
};

export default receiveDms;

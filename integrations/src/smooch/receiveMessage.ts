import {
  getTelegramFile,
  saveConversation,
  saveCustomer,
  saveMessage
} from './api';
import { IAttachment, ISmoochCustomerInput } from './types';

import { Integrations } from '../models';

const receiveMessage = async requestBody => {
  const { trigger } = requestBody;

  if (trigger !== 'message:appUser') {
    return;
  }

  const { appUser, messages, conversation, client } = requestBody;
  const smoochIntegrationId = client.integrationId;

  const customer: ISmoochCustomerInput = {
    smoochIntegrationId,
    surname: appUser.surname,
    givenName: appUser.givenName,
    smoochUserId: appUser._id
  };

  if (client.platform === 'twilio') {
    customer.phone = client.displayName;
  } else if (
    client.platform === 'telegram' &&
    client.raw.profile_photos.total_count !== 0
  ) {
    const { file_id } = client.raw.profile_photos.photos[0][0];

    const { telegramBotToken } = await Integrations.findOne({
      smoochIntegrationId
    });

    customer.avatarUrl = await getTelegramFile(telegramBotToken, file_id);
  } else if (client.platform === 'line' && client.raw.pictureUrl) {
    customer.avatarUrl = client.raw.pictureUrl;
  } else if (client.platform === 'viber' && client.raw.avatar) {
    customer.avatarUrl = client.raw.avatar;
  }

  for (const message of messages) {
    const content = message.text;
    const received = message.received;

    const customerId = await saveCustomer(customer);

    const conversationIds = await saveConversation(
      smoochIntegrationId,
      conversation._id,
      customerId,
      content,
      received
    );

    let attachment: IAttachment;

    if (message.type !== 'text') {
      attachment = { type: message.mediaType, url: message.mediaUrl };
    }

    await saveMessage(
      smoochIntegrationId,
      customerId,
      conversationIds,
      content,
      message._id,
      attachment
    );
  }
};

export default receiveMessage;

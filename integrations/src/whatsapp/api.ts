import * as request from 'request-promise';

import { CHAT_API_INSTANCEAPI_URL, CHAT_API_URL } from './constants';

import { Integrations } from '../models';
import { getConfig } from '../utils';

export interface IAttachment {
  receiverId: string;
  body: string;
  filename: string;
  caption: string;
  instanceId: string;
  token: string;
}

export const reply = async (receiverId: string, content: string, instanceId: string, token: string) => {
  const requestOptions = {
    url: `${CHAT_API_URL}/instance${instanceId}/sendMessage?token=${token}`,
    body: {
      chatId: receiverId,
      body: content,
    },
    json: true,
  };

  try {
    return await request(requestOptions);
  } catch (e) {
    throw new Error(e.message);
  }
};

export const sendFile = async (attachment: IAttachment) => {
  const { instanceId, token, receiverId, body, filename, caption } = attachment;

  const requestOptions = {
    method: 'POST',
    url: `${CHAT_API_URL}/instance${instanceId}/sendFile?token=${token}`,
    body: {
      chatId: receiverId,
      body,
      filename,
      caption,
    },
    json: true,
  };

  try {
    return await request(requestOptions);
  } catch (e) {
    throw new Error(e.message);
  }
};

export const saveInstance = async (integrationId, instanceId, token) => {
  // Check existing Integration

  let integration = await Integrations.findOne({
    $and: [{ whatsappinstanceId: instanceId }, { kind: 'whatsapp' }],
  });

  if (integration) {
    throw new Error(`Integration already exists with this instance id: ${instanceId}`);
  }

  const webhookUrl = await getConfig('CHAT_API_WEBHOOK_CALLBACK_URL');

  if (!webhookUrl) {
    throw new Error('Webhook url is not configured');
  }

  integration = await Integrations.create({
    kind: 'whatsapp',
    erxesApiId: integrationId,
    whatsappinstanceId: instanceId,
    whatsappToken: token,
  });

  const options = {
    uri: `${CHAT_API_URL}/instance${instanceId}/settings?token=${token}`,
    method: 'POST',
    body: {
      webhookUrl,
      ackNotificationsOn: true,
      chatUpdateOn: true,
      videoUploadOn: true,
      statusNotificationsOn: true,
      ignoreOldMessages: true,
    },
    json: true,
  };

  try {
    await request(options);
  } catch (e) {
    await Integrations.deleteOne({ _id: integration.id });
    throw new Error(e.message);
  }
};

export const setupChatApi = async () => {
  const uid = await getConfig('CHAT_API_UID');

  if (!uid) {
    throw new Error('Chat-API api key is not set');
  }

  try {
    const { result } = await request({
      uri: `${CHAT_API_INSTANCEAPI_URL}/listInstances?uid=${uid}`,
      method: 'GET',
      json: true,
    });

    for (const instance of result) {
      const integration = await Integrations.findOne({ whatsappinstanceId: instance.id });

      if (!integration) {
        continue;
      }

      setWebhook(instance.id, integration.whatsappToken);
    }
  } catch (e) {
    throw e;
  }
};

export const logout = async (instanceId, token) => {
  const options = {
    method: 'POST',
    uri: `${CHAT_API_URL}/instance${instanceId}/logout?token=${token}`,
    json: true,
  };

  try {
    await request(options);
  } catch (e) {
    throw e;
  }
};

export const setWebhook = async (instanceId, token) => {
  const webhookUrl = await getConfig('CHAT_API_WEBHOOK_CALLBACK_URL');

  const options = {
    uri: `${CHAT_API_URL}/instance${instanceId}/settings?token=${token}`,
    method: 'POST',
    body: {
      webhookUrl,
      ackNotificationsOn: true,
      chatUpdateOn: true,
      videoUploadOn: true,
      statusNotificationsOn: true,
      ignoreOldMessages: true,
    },
    json: true,
  };

  try {
    await request(options);
  } catch (e) {
    throw e;
  }
};

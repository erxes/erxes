import * as request from 'request-promise';
import { debugWhatsapp } from '../debuggers';
import { Integrations } from '../models';
import { getConfig } from '../utils';
import { CHAT_API_INSTANCEAPI_URL, CHAT_API_URL } from './constants';

interface IAttachment {
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

  integration = await Integrations.create({
    kind: 'whatsapp',
    erxesApiId: integrationId,
    whatsappinstanceId: instanceId,
    whatsappToken: token,
  });

  try {
    return await setWebhook(instanceId, token);
  } catch (e) {
    await Integrations.deleteOne({ _id: integration.id });
    if (e.message.includes('not paid')) {
      debugWhatsapp(`Failed to setup instance: ${e.message}`);
      throw new Error(`Instance "${instanceId}" is not paid. Please pay at app.chat-api.com`);
    } else {
      throw new Error(e.message);
    }
  }
};

export const createInstance = async () => {
  const uid = await getConfig('CHAT_API_UID');

  // newInstance
  const options = {
    method: 'POST',
    uri: `${CHAT_API_INSTANCEAPI_URL}/newInstance`,
    body: {
      uid,
      type: 'whatsapp',
    },
    json: true,
  };

  const { result, error } = await request(options);

  if (error) {
    throw new Error(error);
  }

  const { id, apiUrl, token } = result.instance;

  debugWhatsapp(`sending request to ${apiUrl}status?token=${token}`);

  const qr = await request({ uri: `${apiUrl}status?token=${token}`, method: 'GET', json: true });

  qr.instanceId = id;
  qr.token = token;
  qr.apiUrl = apiUrl;

  return qr;
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

export const removeInstance = async (instanceId, uid) => {
  const options = {
    method: 'POST',
    uri: `${CHAT_API_INSTANCEAPI_URL}/deleteInstance`,
    body: {
      instanceId,
      uid,
    },
    json: true,
  };

  try {
    await request(options);
    await Integrations.deleteOne({ whatsappinstanceId: instanceId });
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

const setWebhook = async (instanceId, token) => {
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
    },
    json: true,
  };

  try {
    await request(options);
  } catch (e) {
    throw e;
  }
};

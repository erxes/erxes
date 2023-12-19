import * as dotenv from 'dotenv';
import { IModels } from './models';
import * as requestify from 'requestify';
import { debugExternalApi } from '@erxes/api-utils/src/debuggers';
import { IRequestParams } from '@erxes/api-utils/src/requests';
import redis from '@erxes/api-utils/src/redis';

dotenv.config();

const CACHE_NAME = 'configs_erxes_zalo_integrations';

export const getConfigs = async (models: IModels) => {
  const configsCache = await redis.get(CACHE_NAME);

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  await redis.set(CACHE_NAME, JSON.stringify(configsMap));

  return configsMap;
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = async () => {
  await redis.set(CACHE_NAME, '');
};

export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string
) => {
  debugExternalApi(`
      Sending request to
      url: ${url}
      method: ${method}
      body: ${JSON.stringify(body)}
      params: ${JSON.stringify(params)}
    `);

  try {
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      form,
      body,
      params
    });

    const responseBody = response.getBody();

    debugExternalApi(`
        Success from : ${url}
        responseBody: ${JSON.stringify(responseBody)}
      `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export const isOASend = (eventName: string = '') => {
  return eventName.startsWith('oa');
};

export interface ZaloMessage {
  event_name?: string;
  app_id?: string;
  message?: {
    msg_id: string;
    text: string;
    attachments?: {
      type: string;
      payload: {
        thumbnail?: string;
        url?: string;
        id?: string;
      };
    }[];
  };
  recipient: {
    id: string;
  };
  sender: {
    id: string;
  };
  timestamp?: string;
}

export const getMessageOAID = ({
  event_name,
  recipient,
  sender
}: ZaloMessage) => {
  return isOASend(event_name) ? sender.id : recipient.id;
};

export const getMessageUserID = ({
  event_name,
  recipient,
  sender
}: ZaloMessage) => {
  return isOASend(event_name) ? recipient.id : sender.id;
};

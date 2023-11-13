import * as dotenv from 'dotenv';
import * as request from 'request-promise';

import { IModels } from './connectionResolver';
import { debugBase, debugExternalRequests } from './debuggers';
import { get, set } from './inmemoryStorage';

dotenv.config();

const CACHE_NAME = 'configs_erxes_fb_integrations';

interface IRequestParams {
  url?: string;
  path?: string;
  headerType?: string;
  headerParams?: { [key: string]: string };
  method: string;
  params?: { [key: string]: string | boolean };
  body?: {
    [key: string]:
      | string
      | string[]
      | boolean
      | number
      | {
          [key: string]: string | number | boolean | any;
        }
      | any
      | any[]
      | {
          [key: string]: {
            [key: string]: string | boolean | any;
          };
        };
  };
}

/**
 * Send request
 */
export const sendRequest = ({
  url,
  headerType,
  headerParams,
  method,
  body,
  params
}: IRequestParams): Promise<any> => {
  return new Promise((resolve, reject) => {
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const reqBody = JSON.stringify(body || {});
    const reqParams = JSON.stringify(params || {});

    debugExternalRequests(`
        Sending request
        url: ${url}
        method: ${method}
        body: ${reqBody}
        params: ${reqParams}
      `);

    request({
      uri: encodeURI(url || ''),
      method,
      headers: {
        'Content-Type': headerType || 'application/json',
        ...headerParams,
        origin: DOMAIN
      },
      ...(headerType && headerType.includes('form')
        ? { form: body }
        : { body }),
      qs: params,
      json: true
    })
      .then(res => {
        debugExternalRequests(`
        Success from ${url}
        requestBody: ${reqBody}
        requestParams: ${reqParams}
        responseBody: ${JSON.stringify(res)}
      `);

        return resolve(res);
      })
      .catch(e => {
        if (e.code === 'ECONNREFUSED') {
          debugExternalRequests(`Failed to connect ${url}`);
          throw new Error(`Failed to connect ${url}`);
        } else {
          debugExternalRequests(`Error occurred in ${url}: ${e.body}`);
          reject(e);
        }
      });
  });
};

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

/*
 * Generate url depending on given file upload publicly or not
 */
export const generateAttachmentUrl = (urlOrName: string) => {
  const DOMAIN = getEnv({ name: 'DOMAIN' });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (urlOrName.startsWith('http')) {
    return urlOrName;
  }

  if (NODE_ENV === 'development') {
    return `${DOMAIN}/pl:core/read-file?key=${urlOrName}`;
  }

  return `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrName}`;
};

export const getConfigs = async (models: IModels) => {
  const configsCache = await get(CACHE_NAME);

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  set(CACHE_NAME, JSON.stringify(configsMap));

  return configsMap;
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = () => {
  set(CACHE_NAME, '');
};

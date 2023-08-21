import { generateAttachmentUrl } from '@erxes/api-utils/src/core';
import * as dotenv from 'dotenv';
import * as request from 'request-promise';
import * as sanitizeHtml from 'sanitize-html';
import { IModels } from './connectionResolver';
import { debugBase, debugExternalRequests } from './debuggers';
import { get, set } from './inmemoryStorage';
import { sendInboxMessage } from './messageBroker';

dotenv.config();
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
 * Check and throw error when concurrent
 * @param {Object} e - error
 * @param {String} name - model
 * @returns throw Error
 */
export const checkConcurrentError = (e: any, name: string) => {
  throw new Error(
    e.message.includes('duplicate')
      ? `Concurrent request: nylas ${name} duplication`
      : e
  );
};

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

/**
 * Clean html and css
 * @param {String} body
 * @returns {String} striped text
 */
export const cleanHtml = (body: string) => {
  const clean = sanitizeHtml(body || '', {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();

  return clean.substring(0, 65);
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

/**
 * Compose functions
 * @param {Functions} fns
 * @returns {Promise} fns value
 */
export const compose = (...fns) => arg =>
  fns.reduceRight((p, f) => p.then(f), Promise.resolve(arg));

export const downloadAttachment = urlOrName => {
  return new Promise(async (resolve, reject) => {
    const url = generateAttachmentUrl(urlOrName);

    const options = {
      url,
      encoding: null
    };

    try {
      await request.get(options).then(res => {
        const buffer = Buffer.from(res, 'utf8');

        resolve(buffer.toString('base64'));
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const getConfigs = async (models: IModels) => {
  const configsCache = await get('configs_erxes_integrations');

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  set('configs_erxes_integrations', JSON.stringify(configsMap));

  return configsMap;
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const getCommonGoogleConfigs = async (subdomain: string) => {
  const response = await sendInboxMessage({
    subdomain,
    action: 'integrations.receive',
    data: {
      action: 'get-configs'
    },
    isRPC: true
  });

  const configs = response.configs;

  return {
    GOOGLE_PROJECT_ID: configs.GOOGLE_PROJECT_ID,
    GOOGLE_CLIENT_ID: configs.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: configs.GOOGLE_CLIENT_SECRET,
    GOOGLE_GMAIL_TOPIC: configs.GOOGLE_GMAIL_TOPIC
  };
};

export const resetConfigsCache = () => {
  set('configs_erxes_integrations', '');
};

export const generateUid = () => {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

export const isAfter = (
  expiresTimestamp: number,
  defaultMillisecond?: number
) => {
  const millisecond = defaultMillisecond || new Date().getTime();
  const expiresMillisecond = new Date(expiresTimestamp * 1000).getTime();

  if (expiresMillisecond > millisecond) {
    return true;
  }

  return false;
};

import * as dotenv from 'dotenv';
import * as sanitizeHtml from 'sanitize-html';
import { IModels } from './connectionResolver';
import { debugBase, debugExternalRequests } from './debuggers';
import redis from '@erxes/api-utils/src/redis';
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
      : e,
  );
};

/**
 * Clean html and css
 * @param {String} body
 * @returns {String} striped text
 */
export const cleanHtml = (body: string) => {
  const clean = sanitizeHtml(body || '', {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  return clean.substring(0, 65);
};

export const getEnv = ({
  name,
  defaultValue,
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
export const compose =
  (...fns) =>
  (arg) =>
    fns.reduceRight((p, f) => p.then(f), Promise.resolve(arg));

export const getConfigs = async (models: IModels) => {
  const configsCache = await redis.get('configs_erxes_integrations');

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  await redis.set('configs_erxes_integrations', JSON.stringify(configsMap));

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
      action: 'get-configs',
    },
    isRPC: true,
  });

  const configs = response.configs;

  return {
    GOOGLE_PROJECT_ID: configs.GOOGLE_PROJECT_ID,
    GOOGLE_CLIENT_ID: configs.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: configs.GOOGLE_CLIENT_SECRET,
    GOOGLE_GMAIL_TOPIC: configs.GOOGLE_GMAIL_TOPIC,
  };
};

export const resetConfigsCache = async () => {
  await redis.set('configs_erxes_integrations', '');
};

export const generateUid = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

export const isAfter = (
  expiresTimestamp: number,
  defaultMillisecond?: number,
) => {
  const millisecond = defaultMillisecond || new Date().getTime();
  const expiresMillisecond = new Date(expiresTimestamp * 1000).getTime();

  if (expiresMillisecond > millisecond) {
    return true;
  }

  return false;
};

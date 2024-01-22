import * as dotenv from 'dotenv';

import { IModels } from './connectionResolver';
import { debugBase, debugExternalRequests } from './debuggers';
import redis from '@erxes/api-utils/src/redis';

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

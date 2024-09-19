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
  subdomain,
  defaultValue
}: {
  name: string;
  subdomain?: string;
  defaultValue?: string;
}): string => {
  let value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (value && subdomain) {
    value = value.replace('<subdomain>', subdomain);
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

/*
 * Generate url depending on given file upload publicly or not
 */
export const generateAttachmentUrl = (subdomain: string, urlOrName: string) => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
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
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return getEnv({ name: code, defaultValue });
  }

  if (!models) {
    return getEnv({ name: code, defaultValue });
  }

  const configs = await getConfigs(models);

  const envValue = getEnv({ name: code, defaultValue });

  if (!configs[code]) {
    return envValue || defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = async () => {
  await redis.set(CACHE_NAME, '');
};

import { redis } from 'erxes-api-shared/utils';
import * as dotenv from 'dotenv';
import { IModels } from '~/connectionResolvers';
import { getEnv } from 'erxes-api-shared/utils';

dotenv.config();

const CACHE_NAME = 'configs_erxes_fb_integrations';

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
  const configsMap: Record<string, string> = {};
  const configs = await models.FacebookConfigs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (
  models: IModels,
  code: string,
  defaultValue?: string,
) => {
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

import * as dotenv from 'dotenv';
import { IModels } from '../models';
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

export const updateConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  await resetConfigsCache();
};

export const resetConfigsCache = async () => {
  await redis.set(CACHE_NAME, '');
};

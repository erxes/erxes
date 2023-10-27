import * as dotenv from 'dotenv';
import { IModels } from '../models';
import { get, set } from '.';

dotenv.config();

const CACHE_NAME = 'configs_erxes_zalo_integrations';

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

export const updateConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  resetConfigsCache();
};

export const resetConfigsCache = () => {
  set(CACHE_NAME, '');
};

import { getEnv, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

const CACHE_NAME = 'configs_erxes_whatsapp_integrations';

export const getConfigs = async (models: IModels) => {
  const configsMap: Record<string, string> = {};
  const configs = await models.WhatsappConfigs.find({});

  for (const config of configs) {
    configsMap[config.code] = String(config.value || '');
  }

  return configsMap;
};

export const getConfig = async (
  models: IModels,
  code: string,
  defaultValue?: string,
) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION === 'saas') {
    return getEnv({ name: code, defaultValue });
  }

  const configs = await getConfigs(models);
  const envValue = getEnv({ name: code, defaultValue });

  return configs[code] || envValue || defaultValue || '';
};

export const resetConfigsCache = async () => {
  await redis.set(CACHE_NAME, '');
};

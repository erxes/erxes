import Configs from './models';

export const getConfigs = async () => {
  const configsMap = {};
  const configs = await Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (code, defaultValue?) => {
  const configs = await getConfigs();

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

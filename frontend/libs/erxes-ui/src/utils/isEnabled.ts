import { readProcessEnvironment } from './config/readProcessEnvironment';

export const isEnabled = (pluginName: string) => {
  const ENABLED_PLUGINS = (
    readProcessEnvironment(() => process.env.ENABLED_PLUGINS) || ''
  )
    .split(',')
    .filter(Boolean);

  return ENABLED_PLUGINS.includes(pluginName);
};

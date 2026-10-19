export const isEnabled = (pluginName: string) => {
  const ENABLED_PLUGINS = (process.env.ENABLED_PLUGINS || '')
    .split(',')
    .filter(Boolean);

  return ENABLED_PLUGINS.includes(pluginName);
};

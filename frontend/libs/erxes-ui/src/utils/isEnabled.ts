export const isEnabled = (pluginName: string) => {
  const ENABLED_PLUGINS_UI = (process.env.ENABLED_PLUGINS_UI || '')
    .split(',')
    .filter(Boolean);

  return ENABLED_PLUGINS_UI.includes(pluginName);
};

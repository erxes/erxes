import type { IUIConfig } from 'erxes-ui';

/** Federation identity is not CONFIG.name (nor the plugin's public URL). */
export const resolvePluginRemoteName = (
  requestedName: string,
  configs: Record<string, IUIConfig> | null | undefined,
): string => {
  if (configs?.[requestedName]) {
    return requestedName;
  }

  const discovered = Object.entries(configs || {}).find(
    ([, config]) => `${config.name}_ui` === requestedName,
  );

  // Widgets may also be addressed by the backend's public plugin identity.
  return discovered?.[0] ?? requestedName.replace(/-/g, '_');
};

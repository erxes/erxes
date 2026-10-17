import { IUIConfig } from 'erxes-ui';

/**
 * A plugin with an app of its own keeps its settings inside that app
 * (`/settings/<plugin path>/…`); settings-only plugins (no app) stay in
 * organization settings.
 */
export const hasOwnAppSettings = (plugin: IUIConfig) =>
  Boolean(plugin.settingsNavigation) && !plugin.settingsOnly;

export const getPluginSettingsPath = (plugin: IUIConfig) =>
  `/settings/${plugin.path}`;

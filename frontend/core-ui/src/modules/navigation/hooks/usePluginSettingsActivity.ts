import { AppPath } from '@/types/paths/AppPath';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IUIConfig } from 'erxes-ui';
import { hasOwnAppSettings } from '@/navigation/utils/pluginSettings';
import { pluginsConfigState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';

export type TPluginSettingsApp = {
  activity: INavigationActivity;
  plugin: IUIConfig;
};

/**
 * The plugin app whose own settings are open (`/settings/<plugin path>/…`).
 * These pages belong to the plugin's app tab, not to organization settings:
 * core frames them with the plugin's own settings navigation. Settings-only
 * plugins have no app and stay in organization settings.
 */
export const usePluginSettingsApp = (): TPluginSettingsApp | undefined => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const activities = useNavigationActivities();
  const { pathname } = useLocation();
  const [section, pluginPath] = pathname.split('/').filter(Boolean);

  if (section !== AppPath.Settings || !pluginPath) {
    return undefined;
  }

  const plugin = Object.values(pluginsConfig || {}).find(
    (config) => config.path === pluginPath && hasOwnAppSettings(config),
  );

  if (!plugin) {
    return undefined;
  }

  const activityId = plugin.navigationGroup?.name || plugin.name;
  const activity = activities.find(
    (item) => item.kind === 'plugin' && item.id === activityId,
  );

  return activity ? { activity, plugin } : undefined;
};

export const usePluginSettingsActivity = (): INavigationActivity | undefined =>
  usePluginSettingsApp()?.activity;

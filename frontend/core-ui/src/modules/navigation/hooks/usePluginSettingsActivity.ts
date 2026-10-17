import { AppPath } from '@/types/paths/AppPath';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { pluginsConfigState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';

/**
 * The plugin app whose own settings are open (`/settings/<plugin path>/…`).
 * Such a plugin draws its settings sidebar itself, so these pages belong to
 * its app, not to organization settings. Settings-only plugins have no app
 * and stay in organization settings.
 */
export const usePluginSettingsActivity = ():
  | INavigationActivity
  | undefined => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const activities = useNavigationActivities();
  const { pathname } = useLocation();
  const [section, pluginPath] = pathname.split('/').filter(Boolean);

  if (section !== AppPath.Settings || !pluginPath) {
    return undefined;
  }

  const plugin = Object.values(pluginsConfig || {}).find(
    (config) =>
      config.path === pluginPath &&
      config.settingsNavigation &&
      !config.settingsOnly,
  );

  if (!plugin) {
    return undefined;
  }

  const activityId = plugin.navigationGroup?.name || plugin.name;

  return activities.find(
    (activity) => activity.kind === 'plugin' && activity.id === activityId,
  );
};

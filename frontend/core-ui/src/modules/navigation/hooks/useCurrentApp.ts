import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import { pluginsConfigState } from 'ui-modules';

const SETTINGS_PREFIX = `/${AppPath.Settings}/`;

/** The app that owns the current route, including its pages under /settings. */
export const useCurrentApp = () => {
  const activities = useNavigationActivities();
  const { pathname } = useLocation();

  return (
    findNavigationActivityByPath(activities, pathname) ??
    activities.find(
      (activity) =>
        activity.kind === 'plugin' &&
        pathname.startsWith(`${SETTINGS_PREFIX}${activity.id}`),
    )
  );
};

/** Settings navigation contributed by the plugins grouped under each app. */
export const useAppSettings = () => {
  const plugins = Object.values(useAtomValue(pluginsConfigState) ?? {});
  const activities = useNavigationActivities();

  const appIds = new Set(
    activities
      .filter((activity) => activity.kind === 'plugin')
      .map((activity) => activity.id),
  );
  const appOf = (config: (typeof plugins)[number]) =>
    config.plugin?.name || config.name;

  const getSettings = (appId?: string) => {
    const activity = activities.find(({ id }) => id === appId);
    const owned = plugins.filter(
      (plugin) => plugin.settingsNavigation && appOf(plugin) === appId,
    );
    const firstPath =
      activity?.modules.find(({ path }) =>
        path.startsWith(SETTINGS_PREFIX.slice(1)),
      )?.path ?? (owned.length > 0 ? `${AppPath.Settings}/${appId}` : null);

    return {
      navigations: owned.flatMap(({ name, settingsNavigation }) =>
        settingsNavigation ? [{ name, Navigation: settingsNavigation }] : [],
      ),
      path: firstPath && `/${firstPath}`,
    };
  };

  return {
    getSettings,
    /** Plugins whose settings live inside their own app, not workspace settings. */
    appPluginNames: plugins
      .filter((plugin) => appIds.has(appOf(plugin)))
      .map((plugin) => plugin.name),
  };
};

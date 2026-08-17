import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import {
  GET_SETTINGS_PATH_DATA,
  SETTINGS_PERMISSION_MAP,
} from '@/settings/constants/data';
import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';
import { TNavigationSearchItem } from '@/search/types/GlobalSearch';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pluginsConfigState, usePermissionCheck, useVersion } from 'ui-modules';

type TSettingsDestination = {
  name: string;
  path: string;
  icon?: React.ElementType;
};

const getDisplayName = (name: string) =>
  /[\sA-Z]/.test(name) ? name : name.charAt(0).toUpperCase() + name.slice(1);

const toSettingsSearchItem = (
  destination: TSettingsDestination,
  section: string,
): TNavigationSearchItem => ({
  id: `go-to:settings:${destination.path.replace(/^\/+/, '')}`,
  title: destination.name,
  description: `Settings › ${section}`,
  icon: destination.icon,
  path: `/${AppPath.Settings}/${destination.path.replace(/^\/+/, '')}`,
});

export const useSettingsNavigationSearchItems = () => {
  const plugins = useAtomValue(pluginsConfigState);
  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: tSettings } = useTranslation('settings');
  const { isLoaded, isWildcard, hasModulePermission, hasPluginPermission } =
    usePermissionCheck();
  const settingsData = useMemo(
    () => GET_SETTINGS_PATH_DATA(version, t),
    [t, version],
  );

  return useMemo(() => {
    const canAccessPath = (path: string) => {
      const requiredModule = SETTINGS_PERMISSION_MAP[path];

      return (
        !requiredModule ||
        !isLoaded ||
        isWildcard ||
        hasModulePermission(requiredModule)
      );
    };
    const toItems = (section: string, destinations: TSettingsDestination[]) =>
      destinations
        .filter(({ path }) => canAccessPath(path))
        .map((destination) => toSettingsSearchItem(destination, section));
    const items = [
      ...toItems(t('account', 'Account'), settingsData.account),
      ...toItems(t('workspace', 'Workspace'), settingsData.nav),
      ...toItems(t('developer', 'Developer'), settingsData.developer),
      ...toItems(
        t('core-modules', 'Core modules'),
        GET_CORE_MODULES(t, version).filter(({ hasSettings }) => hasSettings),
      ),
    ];

    if (canAccessPath(SettingsWorkspacePath.TeamMember)) {
      items.push(
        toSettingsSearchItem(
          {
            name: tSettings('Members', 'Members'),
            path: `${SettingsWorkspacePath.TeamMember}${TeamMembersPath.TeamMembers}`,
          },
          t('team-member', 'Team member'),
        ),
        toSettingsSearchItem(
          {
            name: tSettings('Permission groups', 'Permission groups'),
            path: `${SettingsWorkspacePath.TeamMember}${TeamMembersPath.TeamPermissions}`,
          },
          t('team-member', 'Team member'),
        ),
      );
    }

    Object.values(plugins || {})
      .filter(
        (plugin) =>
          plugin.settingsNavigation &&
          (!isLoaded || isWildcard || hasPluginPermission(plugin.name)),
      )
      .forEach((plugin) => {
        items.push(
          toSettingsSearchItem(
            {
              name: getDisplayName(plugin.name),
              path: plugin.path,
              icon: plugin.icon,
            },
            t('plugins', 'Plugins'),
          ),
        );
      });

    return items;
  }, [
    hasModulePermission,
    hasPluginPermission,
    isLoaded,
    isWildcard,
    plugins,
    settingsData,
    t,
    tSettings,
    version,
  ]);
};

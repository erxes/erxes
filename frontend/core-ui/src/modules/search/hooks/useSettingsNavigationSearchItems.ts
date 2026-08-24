import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import {
  GET_SETTINGS_PATH_DATA,
  SETTINGS_PERMISSION_MAP,
} from '@/settings/constants/data';
import { TeamMembersPath } from '@/settings/team-member/constants/teamMemberRoutes';
import { TNavigationSearchItem } from '@/search/types/GlobalSearch';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pluginsConfigState, usePermissionCheck, useVersion } from 'ui-modules';
import { useAtomValue } from 'jotai';

type TSettingsDestination = {
  name: string;
  path: string;
  icon?: React.ElementType;
};

const toSettingsSearchItem = (
  destination: TSettingsDestination,
  section: string,
  settingsPrefix: string,
): TNavigationSearchItem => ({
  id: `go-to:settings:${destination.path.replace(/^\/+/, '')}`,
  title: destination.name,
  description: `${settingsPrefix} › ${section}`,
  icon: destination.icon,
  path: `/${AppPath.Settings}/${destination.path.replace(/^\/+/, '')}`,
});

export const useSettingsNavigationSearchItems = () => {
  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: tSettings } = useTranslation('settings');
  const { isLoaded, isWildcard, hasModulePermission, hasPluginPermission } =
    usePermissionCheck();
  const pluginsMetaData = useAtomValue(pluginsConfigState);
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
    const settingsPrefix = t('settings', 'Settings');
    const toItems = (section: string, destinations: TSettingsDestination[]) =>
      destinations
        .filter(({ path }) => canAccessPath(path))
        .map((destination) =>
          toSettingsSearchItem(destination, section, settingsPrefix),
        );
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
          settingsPrefix,
        ),
        toSettingsSearchItem(
          {
            name: tSettings('Permission groups', 'Permission groups'),
            path: `${SettingsWorkspacePath.TeamMember}${TeamMembersPath.TeamPermissions}`,
          },
          t('team-member', 'Team member'),
          settingsPrefix,
        ),
      );
    }

    const settingsOnlyPluginItems = Object.values(
      pluginsMetaData || {},
    ).flatMap((plugin) => {
      if (!plugin.settingsOnly || !plugin.modules?.length) return [];
      if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name))
        return [];

      const sectionLabel =
        plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1);

      return plugin.modules
        .filter((module) => module.path.startsWith('settings/'))
        .map((module) =>
          toSettingsSearchItem(
            { name: module.name, icon: module.icon, path: module.path },
            sectionLabel,
            settingsPrefix,
          ),
        );
    });

    return [...items, ...settingsOnlyPluginItems];
  }, [
    hasModulePermission,
    hasPluginPermission,
    isLoaded,
    isWildcard,
    pluginsMetaData,
    settingsData,
    t,
    tSettings,
    version,
  ]);
};

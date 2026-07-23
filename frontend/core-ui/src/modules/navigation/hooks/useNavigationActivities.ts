import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck, useVersion } from 'ui-modules';

const getDisplayName = (name: string) =>
  /[\sA-Z]/.test(name) ? name : name.charAt(0).toUpperCase() + name.slice(1);

export const useNavigationActivities = (): INavigationActivity[] => {
  const navigationGroups = usePluginsNavigationGroups();
  const version = useVersion();
  const { i18n, t } = useTranslation('common', {
    keyPrefix: 'core-modules',
  });
  const { isLoaded, hasModulePermission, isWildcard } = usePermissionCheck();

  return useMemo(() => {
    const pluginActivities = Object.entries(navigationGroups)
      .filter(([, group]) => group.modules.length > 0)
      .map(([name, group]): INavigationActivity => {
        const fallbackLabel = getDisplayName(name);
        const label = group.i18n
          ? getDisplayName(
              i18n.t(name, {
                ns: name,
                defaultValue: fallbackLabel,
              }),
            )
          : fallbackLabel;

        return {
          id: name,
          label,
          icon: group.icon,
          kind: 'plugin',
          modules: group.modules,
          defaultPath: group.modules[0].path,
        };
      });

    const coreActivities = GET_CORE_MODULES(t, version)
      .filter((module) => {
        if (module.settingsOnly) {
          return false;
        }

        return !isLoaded || isWildcard || hasModulePermission(module.path);
      })
      .map(
        (module): INavigationActivity => ({
          id: `core:${module.path}`,
          label: module.name,
          icon: module.icon,
          kind: 'core',
          modules: [module],
          defaultPath: module.path,
        }),
      );

    return [...pluginActivities, ...coreActivities];
  }, [
    hasModulePermission,
    i18n,
    i18n.language,
    isLoaded,
    isWildcard,
    navigationGroups,
    t,
    version,
  ]);
};

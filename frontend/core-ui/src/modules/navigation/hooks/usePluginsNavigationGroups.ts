import { IUIConfig } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pluginsConfigState, usePermissionCheck, useVersion } from 'ui-modules';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';

export const usePluginsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, hasPluginPermission, isWildcard } = usePermissionCheck();

  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'core-modules' });

  const CORE_MODULES = GET_CORE_MODULES(t, version);

  const modules = useMemo(() => {
    if (pluginsMetaData) {
      const pluginsModules = Object.values(pluginsMetaData || {}).flatMap(
        (plugin) => {
          if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
            return [];
          }

          return (plugin.modules || []).map((module) => ({
            ...module,
            pluginName: plugin.name,
          }));
        },
      );

      return [...CORE_MODULES, ...pluginsModules] as IUIConfig['modules'];
    }
    return CORE_MODULES;
  }, [pluginsMetaData, t, version, isLoaded, isWildcard, hasPluginPermission]);

  return modules;
};

interface ContentEntry {
  render: () => React.ReactNode;
  pluginName: string;
}

interface SubGroupEntry {
  exposeName: string;
  pluginName: string;
}

interface NavigationGroupResult {
  icon?: React.ElementType;
  contents: ContentEntry[];
  subGroups: SubGroupEntry[];
  name: string;
}

type NavigationGroups = Record<string, NavigationGroupResult>;

export const usePluginsNavigationGroups = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, hasPluginPermission, isWildcard } = usePermissionCheck();

  const navigationGroups = useMemo(() => {
    if (!pluginsMetaData) {
      return {};
    }

    return Object.values(pluginsMetaData).reduce<NavigationGroups>(
      (acc, plugin) => {
        if (!plugin?.modules?.length) return acc;

        if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
          return acc;
        }

        const groupName = plugin.navigationGroup?.name || plugin.name;

        const existingGroup = acc[groupName] || {
          contents: [],
          subGroups: [],
        };

        const newContent = plugin.navigationGroup?.content;
        const updatedContents = newContent
          ? [
              ...existingGroup.contents,
              { render: newContent, pluginName: plugin.name },
            ]
          : existingGroup.contents;

        const subGroupExpose = plugin.navigationGroup?.subGroup;
        const updatedSubGroups = subGroupExpose
          ? [
              ...existingGroup.subGroups,
              { exposeName: subGroupExpose, pluginName: plugin.name },
            ]
          : existingGroup.subGroups;

        acc[groupName] = {
          name: groupName,
          icon: plugin.navigationGroup?.icon || existingGroup.icon,
          contents: updatedContents,
          subGroups: updatedSubGroups,
        };

        return acc;
      },
      {},
    );
  }, [pluginsMetaData, isLoaded, isWildcard, hasPluginPermission]);

  return navigationGroups;
};

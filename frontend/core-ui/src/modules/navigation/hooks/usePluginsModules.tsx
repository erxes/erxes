import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { IUIConfig } from 'erxes-ui';
import { GET_CORE_MODULES } from '~/plugins/constants/core-plugins.constants';
import { pluginsConfigState } from 'ui-modules';
import { useVersion } from 'ui-modules';

export const usePluginsModules = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  const version = useVersion();

  const CORE_MODULES = GET_CORE_MODULES(version);

  const modules = useMemo(() => {
    if (pluginsMetaData) {
      const pluginsModules = Object.values(pluginsMetaData || {}).flatMap(
        (plugin) =>
          plugin.modules.map((module) => ({
            ...module,
            pluginName: plugin.name,
          })),
      );

      return [...CORE_MODULES, ...pluginsModules] as IUIConfig['modules'];
    }
    return CORE_MODULES;
  }, [pluginsMetaData]);

  return modules;
};

interface NavigationGroupResult {
  icon?: React.ElementType;
  contents: any[];
  subGroups: any[];
  name: string;
}

type NavigationGroups = Record<string, NavigationGroupResult>;

export const usePluginsNavigationGroups = (): NavigationGroups => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  const navigationGroups = useMemo(() => {
    if (!pluginsMetaData) {
      return {};
    }

    return Object.values(pluginsMetaData).reduce<NavigationGroups>(
      (acc, plugin) => {
        const groupName = plugin.navigationGroup?.name || plugin.name;

        const existingGroup = acc[groupName] || {
          contents: [],
          subGroups: [],
        };

        const newContent = plugin.navigationGroup?.content;
        const updatedContents = newContent
          ? [...existingGroup.contents, newContent]
          : existingGroup.contents;

        const newSubGroup = plugin.navigationGroup?.subGroups;
        const updatedSubGroups = newSubGroup
          ? [...existingGroup.subGroups, newSubGroup]
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
  }, [pluginsMetaData]);

  return navigationGroups;
};

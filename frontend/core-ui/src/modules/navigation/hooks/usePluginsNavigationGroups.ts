import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

interface NavigationGroupResult {
  icon?: React.ElementType;
  contents: any[];
  subGroups: any[];
  name: string;
}

type NavigationGroups = Record<string, NavigationGroupResult>;

export const usePluginsNavigationGroups = () => {
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

        const newSubGroup = plugin.navigationGroup?.subGroup;
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

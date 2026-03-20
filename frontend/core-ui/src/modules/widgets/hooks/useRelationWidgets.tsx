import { useAtom } from 'jotai';
import { pluginsConfigState, IRelationModules, usePermissionCheck } from 'ui-modules';
import { Icon } from '@tabler/icons-react';
import { CORE_RELATIONS } from '../constants/core-relations';

export const useRelationWidgetsModules = (): IRelationModules[] => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  const pluginsRelationWidgets = plugins.flatMap((plugin) => {
    if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
      return [];
    }

    return (plugin.widgets?.relationWidgets || []).map((module) => ({
      pluginName: plugin.name,
      icon: module.icon as Icon,
      name: module.name,
    }));
  });

  return [...CORE_RELATIONS, ...pluginsRelationWidgets];
};

import { useAtom } from 'jotai';
import {
  pluginsConfigState,
  IFormWidgetModule,
  usePermissionCheck,
} from 'ui-modules';
import { Icon } from '@tabler/icons-react';

export const useFormWidgetsModules = (
  contentType: string,
): IFormWidgetModule[] => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  return plugins.flatMap((plugin) => {
    if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
      return [];
    }

    return (plugin.widgets?.formWidgets || [])
      .filter((module) => module.contentType === contentType)
      .map((module) => ({
        pluginName: plugin.name,
        contentType: module.contentType,
        icon: module.icon as Icon,
        name: module.name,
      }));
  });
};

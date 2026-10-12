import { Icon } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import {
  IRelationSettingsModule,
  pluginsConfigState,
  usePermissionCheck,
} from 'ui-modules';

// Every enabled plugin's settings sections, for the plugins this user may use.
export const useRelationSettingsWidgetsModules =
  (): IRelationSettingsModule[] => {
    const pluginsMetaData = useAtomValue(pluginsConfigState);
    const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

    return Object.values(pluginsMetaData || {}).flatMap((plugin) => {
      if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
        return [];
      }

      return (plugin.widgets?.relationSettingsWidgets || []).map((module) => ({
        pluginName: plugin.name,
        name: module.name,
        icon: module.icon as Icon,
        label: module.label,
      }));
    });
  };

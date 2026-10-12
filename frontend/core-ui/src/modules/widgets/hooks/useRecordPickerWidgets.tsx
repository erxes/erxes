import { useAtomValue } from 'jotai';
import {
  IRecordPickerModule,
  pluginsConfigState,
  usePermissionCheck,
} from 'ui-modules';

// Every enabled plugin's record pickers, for the plugins this user may use.
export const useRecordPickerWidgetsModules = (): IRecordPickerModule[] => {
  const pluginsMetaData = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  return Object.values(pluginsMetaData || {}).flatMap((plugin) => {
    if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
      return [];
    }

    return (plugin.widgets?.recordPickerWidgets || []).map((module) => ({
      pluginName: plugin.name,
      name: module.name,
      contentType: module.contentType,
    }));
  });
};

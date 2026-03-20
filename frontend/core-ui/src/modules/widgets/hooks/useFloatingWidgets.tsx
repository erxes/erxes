import { useAtom } from 'jotai';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

export const useFloatingWidgets = () => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  if (!pluginsMetaData) {
    return [];
  }

  const plugins = Object.values(pluginsMetaData);

  return plugins.filter((plugin) => {
    if (!plugin.hasFloatingWidget) return false;

    if (!isLoaded || isWildcard) return true;
    
    return hasPluginPermission(plugin.name);
  });
};

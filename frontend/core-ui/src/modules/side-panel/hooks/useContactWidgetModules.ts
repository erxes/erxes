import { Icon } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

export interface IContactWidgetModule {
  pluginName: string;
  name: string;
  label?: string;
  icon?: Icon;
}

// The sections plugins add to a contact's overview (`widgets.contactWidgets`)
// that the user may see.
export const useContactWidgetModules = (): IContactWidgetModule[] => {
  const pluginsMetaData = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  return useMemo(
    () =>
      Object.values(pluginsMetaData || {}).flatMap((plugin) => {
        if (isLoaded && !isWildcard && !hasPluginPermission(plugin.name)) {
          return [];
        }

        return (plugin.widgets?.contactWidgets || []).map((module) => ({
          pluginName: plugin.name,
          name: module.name,
          label: module.label,
          icon: module.icon as Icon | undefined,
        }));
      }),
    [pluginsMetaData, isLoaded, isWildcard, hasPluginPermission],
  );
};

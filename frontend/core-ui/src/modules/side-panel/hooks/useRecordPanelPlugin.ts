import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

/**
 * The plugin that draws `contentType` records in the side panel (its config
 * lists the type under `widgets.recordPanels`), if the user may use it, and
 * whether those records have a Properties tab.
 */
export const useRecordPanelPlugin = (
  contentType: string,
): { pluginName: string | null; hasProperties: boolean } => {
  const pluginsMetaData = useAtomValue(pluginsConfigState);
  const { isLoaded, isWildcard, hasPluginPermission } = usePermissionCheck();

  return useMemo(() => {
    const plugin = Object.values(pluginsMetaData || {}).find((config) =>
      config.widgets?.recordPanels?.some(
        (panel) => panel.contentType === contentType,
      ),
    );

    const panel = plugin?.widgets?.recordPanels?.find(
      (entry) => entry.contentType === contentType,
    );

    if (
      !plugin ||
      (isLoaded && !isWildcard && !hasPluginPermission(plugin.name))
    ) {
      return { pluginName: null, hasProperties: false };
    }

    return {
      pluginName: plugin.name,
      hasProperties: panel?.properties !== false,
    };
  }, [pluginsMetaData, contentType, isLoaded, isWildcard, hasPluginPermission]);
};

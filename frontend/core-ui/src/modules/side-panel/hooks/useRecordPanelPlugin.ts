import type { IUIConfig } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

export type TRecordPanelPluginTab = NonNullable<
  NonNullable<NonNullable<IUIConfig['widgets']>['recordPanels']>[number]['tabs']
>[number];

/**
 * The plugin that draws `contentType` records in the side panel (its config
 * lists the type under `widgets.recordPanels`), if the user may use it, and
 * whether those records have a Properties tab.
 */
export const useRecordPanelPlugin = (
  contentType: string,
): {
  pluginName: string | null;
  hasProperties: boolean;
  hasDraftTitle: boolean;
  tabs: TRecordPanelPluginTab[];
} => {
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
      return {
        pluginName: null,
        hasProperties: false,
        hasDraftTitle: false,
        tabs: [],
      };
    }

    return {
      pluginName: plugin.name,
      hasProperties: panel?.properties !== false,
      hasDraftTitle: panel?.draftTitle === true,
      tabs: panel?.tabs ?? [],
    };
  }, [pluginsMetaData, contentType, isLoaded, isWildcard, hasPluginPermission]);
};

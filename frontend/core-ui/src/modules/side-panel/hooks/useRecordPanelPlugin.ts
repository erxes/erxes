import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';

/**
 * The plugin that draws `contentType` records in the side panel (its config
 * lists the type under `widgets.recordPanels`), if the user may use it, and
 * whether those records have a Properties tab.
 */
export interface IRecordPanelPluginTab {
  value: string;
  label: string;
}

const NO_TABS: IRecordPanelPluginTab[] = [];

export const useRecordPanelPlugin = (
  contentType: string,
): {
  pluginName: string | null;
  hasProperties: boolean;
  hasDraftTitle: boolean;
  hasPageExpanded: boolean;
  tabs: IRecordPanelPluginTab[];
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
        hasPageExpanded: false,
        tabs: NO_TABS,
      };
    }

    return {
      pluginName: plugin.name,
      hasProperties: panel?.properties !== false,
      hasDraftTitle: panel?.draftTitle === true,
      hasPageExpanded: panel?.pageExpanded === true,
      tabs: panel?.tabs ?? NO_TABS,
    };
  }, [pluginsMetaData, contentType, isLoaded, isWildcard, hasPluginPermission]);
};

const PAGE_EXPANDED_CONTENT_TYPES = ['core:customer', 'core:company'];

export const useRecordExpandsInPage = (contentType?: string) => {
  const { hasPageExpanded } = useRecordPanelPlugin(contentType || '');

  return Boolean(
    contentType &&
      (PAGE_EXPANDED_CONTENT_TYPES.includes(contentType) || hasPageExpanded),
  );
};

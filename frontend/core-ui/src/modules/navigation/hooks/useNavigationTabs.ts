import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { navigationTabsState } from '@/navigation/states/navigationShellState';
import { activePluginState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';

export const useNavigationTabs = () => {
  const navigationGroups = usePluginsNavigationGroups();
  const [tabIds, setTabIds] = useAtom(navigationTabsState);
  const [activePlugin, setActivePlugin] = useAtom(activePluginState);

  const pluginIds = useMemo(
    () => Object.keys(navigationGroups),
    [navigationGroups],
  );

  useEffect(() => {
    if (pluginIds.length === 0) {
      return;
    }

    setTabIds((currentTabIds) =>
      currentTabIds.filter((pluginId) => pluginIds.includes(pluginId)),
    );

    if (activePlugin && pluginIds.includes(activePlugin)) {
      setTabIds((currentTabIds) =>
        currentTabIds.includes(activePlugin)
          ? currentTabIds
          : [...currentTabIds, activePlugin],
      );
    }
  }, [activePlugin, pluginIds, setTabIds]);

  const tabs = useMemo(
    () =>
      tabIds.flatMap((pluginId) => {
        const group = navigationGroups[pluginId];

        return group ? [{ id: pluginId, group }] : [];
      }),
    [navigationGroups, tabIds],
  );

  const openTab = useCallback(
    (pluginId: string) => {
      if (!navigationGroups[pluginId]) {
        return;
      }

      setTabIds((currentTabIds) =>
        currentTabIds.includes(pluginId)
          ? currentTabIds
          : [...currentTabIds, pluginId],
      );
      setActivePlugin(pluginId);
    },
    [navigationGroups, setActivePlugin, setTabIds],
  );

  const closeTab = useCallback(
    (pluginId: string) => {
      const tabIndex = tabIds.indexOf(pluginId);
      const nextTabIds = tabIds.filter((tabId) => tabId !== pluginId);

      setTabIds(nextTabIds);

      if (activePlugin === pluginId) {
        setActivePlugin(
          nextTabIds[Math.min(tabIndex, nextTabIds.length - 1)] || null,
        );
      }
    },
    [activePlugin, setActivePlugin, setTabIds, tabIds],
  );

  const reorderTabs = useCallback(
    (sourcePluginId: string, targetPluginId: string) => {
      if (sourcePluginId === targetPluginId) {
        return;
      }

      setTabIds((currentTabIds) => {
        const sourceIndex = currentTabIds.indexOf(sourcePluginId);
        const targetIndex = currentTabIds.indexOf(targetPluginId);

        if (sourceIndex === -1 || targetIndex === -1) {
          return currentTabIds;
        }

        const nextTabIds = [...currentTabIds];
        const [sourcePlugin] = nextTabIds.splice(sourceIndex, 1);

        nextTabIds.splice(targetIndex, 0, sourcePlugin);

        return nextTabIds;
      });
    },
    [setTabIds],
  );

  return {
    activePlugin,
    closeTab,
    navigationGroups,
    openTab,
    reorderTabs,
    tabIds,
    tabs,
  };
};

import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { navigationActivityItemCountsState } from '@/navigation/states/navigationPanelState';
import {
  getNavigationPlacement,
  TNavigationPlacement,
} from '@/navigation/utils/navigationPlacement';
import { Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

export const useNavigationPlacement = () => {
  const itemCounts = useAtomValue(navigationActivityItemCountsState);
  const navigationGroups = usePluginsNavigationGroups();
  const { isMobile } = Sidebar.useSidebar();

  return useCallback(
    (activityId: string): TNavigationPlacement =>
      isMobile
        ? 'inline'
        : getNavigationPlacement(
            itemCounts[activityId],
            Boolean(navigationGroups[activityId]?.subGroups.length),
          ),
    [isMobile, itemCounts, navigationGroups],
  );
};

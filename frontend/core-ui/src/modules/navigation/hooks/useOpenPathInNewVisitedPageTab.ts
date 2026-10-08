import {
  activeVisitedPageTabIdState,
  visitedPageTabsState,
  visitedPageTabsVisibleState,
} from '@/navigation/states/visitedPageTabsState';
import {
  createVisitedPageTabId,
  insertVisitedPageTabAfter,
} from '@/navigation/utils/visitedPageTabs';
import { useAtom, useSetAtom } from 'jotai';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useOpenPathInNewVisitedPageTab = () => {
  const [activeTabId, setActiveTabId] = useAtom(activeVisitedPageTabIdState);
  const setTabs = useSetAtom(visitedPageTabsState);
  const setTabsVisible = useSetAtom(visitedPageTabsVisibleState);
  const navigate = useNavigate();

  return useCallback(
    (path: string) => {
      const pathname = `/${path.replace(/^\/+/, '')}`;
      const tabId = createVisitedPageTabId();

      setTabs((currentTabs) =>
        insertVisitedPageTabAfter(
          currentTabs,
          { id: tabId, pathname },
          activeTabId,
        ),
      );
      setTabsVisible(true);
      setActiveTabId(tabId);
      navigate(pathname);
    },
    [activeTabId, navigate, setActiveTabId, setTabs, setTabsVisible],
  );
};

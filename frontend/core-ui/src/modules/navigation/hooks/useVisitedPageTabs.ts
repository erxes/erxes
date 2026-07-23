import { visitedPageTabsState } from '@/navigation/states/visitedPageTabsState';
import { AppPath } from '@/types/paths/AppPath';
import {
  addVisitedPageTab,
  getVisitedPageTabCloseDestination,
  normalizeVisitedPagePathname,
  removeVisitedPageTab,
  shouldTrackVisitedPage,
} from '@/navigation/utils/visitedPageTabs';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_VISITED_PAGE_PATH = `/${AppPath.MyInbox}`;

export const useVisitedPageTabs = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useAtom(visitedPageTabsState);
  const activePathname = normalizeVisitedPagePathname(pathname);

  useEffect(() => {
    if (!shouldTrackVisitedPage(activePathname)) {
      return;
    }

    setTabs((currentTabs) => addVisitedPageTab(currentTabs, activePathname));
  }, [activePathname, setTabs]);

  const openVisitedPageTab = useCallback(
    (tabPathname: string) => {
      navigate(tabPathname);
    },
    [navigate],
  );

  const closeVisitedPageTab = useCallback(
    (tabPathname: string) => {
      const closeDestination = getVisitedPageTabCloseDestination(
        tabs,
        tabPathname,
      );

      setTabs((currentTabs) => removeVisitedPageTab(currentTabs, tabPathname));

      if (tabPathname === activePathname) {
        navigate(closeDestination ?? DEFAULT_VISITED_PAGE_PATH);
      }
    },
    [activePathname, navigate, setTabs, tabs],
  );

  return {
    activePathname,
    closeVisitedPageTab,
    openVisitedPageTab,
    tabs,
  };
};

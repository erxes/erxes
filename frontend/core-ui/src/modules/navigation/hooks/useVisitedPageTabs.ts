import {
  activeVisitedPageTabIdState,
  visitedPageTabsState,
} from '@/navigation/states/visitedPageTabsState';
import { AppPath } from '@/types/paths/AppPath';
import {
  createVisitedPageTabId,
  getVisitedPageTabCloseDestination,
  getVisitedPageTabLocation,
  insertVisitedPageTabAfter,
  moveVisitedPageTab,
  normalizeVisitedPagePathname,
  removeVisitedPageTab,
  shouldTrackVisitedPage,
  updateVisitedPageTab,
} from '@/navigation/utils/visitedPageTabs';
import { useAtom } from 'jotai';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HOME_PAGE_PATH = `/${AppPath.MyInbox}`;

export const useVisitedPageTabs = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useAtom(visitedPageTabsState);
  const [activeTabId, setActiveTabId] = useAtom(activeVisitedPageTabIdState);
  const activePathname = normalizeVisitedPagePathname(pathname);
  const activeTabIdRef = useRef(activeTabId);
  const tabsRef = useRef(tabs);

  activeTabIdRef.current = activeTabId;
  tabsRef.current = tabs;

  const selectVisitedPageTab = useCallback(
    (tabId: string) => {
      activeTabIdRef.current = tabId;
      setActiveTabId(tabId);
    },
    [setActiveTabId],
  );

  useLayoutEffect(() => {
    if (!shouldTrackVisitedPage(activePathname)) {
      return;
    }

    const currentTabs = tabsRef.current;
    const currentTabId = activeTabIdRef.current;
    const existingActiveTab = currentTabs.find(
      (tab) => tab.id === currentTabId,
    );
    const matchingTab = currentTabs.find(
      (tab) => tab.pathname === activePathname,
    );
    const tabId =
      existingActiveTab?.id ?? matchingTab?.id ?? createVisitedPageTabId();

    if (tabId !== currentTabId) {
      selectVisitedPageTab(tabId);
    }

    setTabs((current) =>
      updateVisitedPageTab(current, tabId, activePathname, search),
    );
  }, [activePathname, search, selectVisitedPageTab, setTabs]);

  const openVisitedPageTab = useCallback(
    (tabId: string) => {
      const destinationTab = tabs.find((tab) => tab.id === tabId);

      if (!destinationTab) {
        return;
      }

      selectVisitedPageTab(tabId);
      navigate(getVisitedPageTabLocation(destinationTab));
    },
    [navigate, selectVisitedPageTab, tabs],
  );

  const openNewVisitedPageTab = useCallback(() => {
    const tabId = createVisitedPageTabId();

    setTabs((currentTabs) =>
      insertVisitedPageTabAfter(
        currentTabs,
        { id: tabId, pathname: HOME_PAGE_PATH },
        activeTabIdRef.current,
      ),
    );
    selectVisitedPageTab(tabId);
    navigate(HOME_PAGE_PATH);
  }, [navigate, selectVisitedPageTab, setTabs]);

  const closeVisitedPageTab = useCallback(
    (tabId: string) => {
      const closeDestination = getVisitedPageTabCloseDestination(tabs, tabId);

      if (tabId === activeTabIdRef.current) {
        if (!closeDestination) {
          const homeTabId = createVisitedPageTabId();

          setTabs([{ id: homeTabId, pathname: HOME_PAGE_PATH }]);
          selectVisitedPageTab(homeTabId);
          navigate(HOME_PAGE_PATH, { replace: true });
          return;
        }

        setTabs((currentTabs) => removeVisitedPageTab(currentTabs, tabId));
        selectVisitedPageTab(closeDestination.id);
        navigate(getVisitedPageTabLocation(closeDestination), {
          replace: true,
        });
        return;
      }

      setTabs((currentTabs) => removeVisitedPageTab(currentTabs, tabId));
    },
    [navigate, selectVisitedPageTab, setTabs, tabs],
  );

  const closeAllVisitedPageTabs = useCallback(() => {
    const homeTabId = createVisitedPageTabId();

    setTabs([{ id: homeTabId, pathname: HOME_PAGE_PATH }]);
    selectVisitedPageTab(homeTabId);
    navigate(HOME_PAGE_PATH, { replace: true });
  }, [navigate, selectVisitedPageTab, setTabs]);

  const reorderVisitedPageTab = useCallback(
    (tabId: string, destinationTabId: string) => {
      setTabs((currentTabs) =>
        moveVisitedPageTab(currentTabs, tabId, destinationTabId),
      );
    },
    [setTabs],
  );

  return {
    activeTabId,
    closeAllVisitedPageTabs,
    closeVisitedPageTab,
    openNewVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  };
};

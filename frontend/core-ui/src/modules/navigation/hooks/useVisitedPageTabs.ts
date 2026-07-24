import { visitedPageTabsState } from '@/navigation/states/visitedPageTabsState';
import { AppPath } from '@/types/paths/AppPath';
import {
  getVisitedPageTabCloseDestination,
  moveVisitedPageTab,
  normalizeVisitedPagePathname,
  removeVisitedPageTab,
  shouldTrackVisitedPage,
  visitVisitedPageTab,
} from '@/navigation/utils/visitedPageTabs';
import { useAtom } from 'jotai';
import {
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';

const DEFAULT_VISITED_PAGE_PATH = `/${AppPath.MyInbox}`;

export const useVisitedPageTabs = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const [tabs, setTabs] = useAtom(visitedPageTabsState);
  const activePathname = normalizeVisitedPagePathname(pathname);
  const previousPathname = useRef(activePathname);

  useLayoutEffect(() => {
    if (!shouldTrackVisitedPage(activePathname)) {
      previousPathname.current = activePathname;
      return;
    }

    const replacedPathname =
      navigationType === 'REPLACE' ? previousPathname.current : undefined;

    setTabs((currentTabs) =>
      visitVisitedPageTab(
        currentTabs,
        activePathname,
        replacedPathname,
      ),
    );
    previousPathname.current = activePathname;
  }, [activePathname, navigationType, setTabs]);

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

      if (tabPathname === activePathname) {
        navigate(closeDestination ?? DEFAULT_VISITED_PAGE_PATH, {
          replace: true,
        });
        return;
      }

      setTabs((currentTabs) => removeVisitedPageTab(currentTabs, tabPathname));
    },
    [activePathname, navigate, setTabs, tabs],
  );

  const reorderVisitedPageTab = useCallback(
    (tabPathname: string, destinationPathname: string) => {
      setTabs((currentTabs) =>
        moveVisitedPageTab(currentTabs, tabPathname, destinationPathname),
      );
    },
    [setTabs],
  );

  return {
    activePathname,
    closeVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  };
};

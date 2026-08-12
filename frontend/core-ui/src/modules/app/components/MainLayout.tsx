import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { MobileNavigationTrigger } from '@/navigation/components/MobileNavigationTrigger';
import { NavigationPanel } from '@/navigation/components/NavigationPanel';
import { VisitedPageTabs } from '@/navigation/components/VisitedPageTabs';
import { VisitedPageTabsOpenButton } from '@/navigation/components/VisitedPageTabsOpenButton';
import { navigationSidebarOpenState } from '@/navigation/states/navigationPanelState';
import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';
import { GlobalSearch } from '@/search/components/GlobalSearch';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { cn, Sidebar, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { Outlet } from 'react-router';

const NavigationWorkspace = () => {
  const { isMobile } = Sidebar.useSidebar();
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);

  return (
    <Sidebar.Inset
      className={cn(
        'h-svh grow-0 shrink basis-full overflow-hidden shadow-sidebar-inset',
        tabsVisible && 'pt-10',
      )}
    >
      <div className="relative flex min-h-0 flex-1">
        {!isMobile && <NavigationPanel />}
        <div
          className={cn(
            'relative flex min-w-0 flex-1 flex-col overflow-hidden peer-data-[state=collapsed]:[--navigation-panel-toggle-space:2.5rem] peer-data-[state=collapsed]:[--navigation-top-controls-space:2rem]',
            isMobile &&
              '[--navigation-panel-toggle-space:2.5rem] [--navigation-top-controls-space:2.25rem]',
            !tabsVisible &&
              '[--visited-page-tabs-open-button-space:2.75rem] [--navigation-top-controls-space:2.25rem]',
          )}
        >
          <MobileNavigationTrigger />
          <VisitedPageTabsOpenButton />
          <FloatingWidgets />
          <Outlet />
        </div>
      </div>
    </Sidebar.Inset>
  );
};

export const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(navigationSidebarOpenState);
  const [inPreview] = useQueryState<boolean>('inPreview');
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <Sidebar.Provider
      className="w-screen"
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      sidebarKeyboardShortcut={false}
      sidebarWidth="13rem"
      sidebarWidthIcon="3rem"
    >
      <VisitedPageTabs />
      <GlobalSearch />
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className={cn('p-0', tabsVisible && 'pt-10')}
      >
        <MainNavigationBar />
      </Sidebar>
      <NavigationWorkspace />
    </Sidebar.Provider>
  );
};

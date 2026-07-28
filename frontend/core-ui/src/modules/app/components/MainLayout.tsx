import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { NavigationPanel } from '@/navigation/components/NavigationPanel';
import { VisitedPageTabs } from '@/navigation/components/VisitedPageTabs';
import { navigationSidebarOpenState } from '@/navigation/states/navigationPanelState';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { Sidebar, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Outlet } from 'react-router';

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationWorkspace = () => {
  const { isMobile } = Sidebar.useSidebar();

  return (
    <Sidebar.Inset className="h-svh grow-0 shrink basis-full overflow-hidden pt-10 shadow-sidebar-inset">
      <div className="relative flex min-h-0 flex-1">
        {!isMobile && <NavigationPanel />}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden peer-data-[state=collapsed]:[--navigation-panel-toggle-space:2.5rem]">
          <FloatingWidgets />
          <Outlet />
        </div>
      </div>
    </Sidebar.Inset>
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(navigationSidebarOpenState);
  const [inPreview] = useQueryState<boolean>('inPreview');

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
      sidebarWidthIcon="3.5rem"
    >
      <VisitedPageTabs />
      <Sidebar collapsible="icon" variant="sidebar" className="p-0 pt-10">
        <MainNavigationBar />
      </Sidebar>
      <NavigationWorkspace />
    </Sidebar.Provider>
  );
};

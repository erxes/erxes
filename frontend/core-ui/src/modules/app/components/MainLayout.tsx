import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { PageLoadingProvider } from '@/navigation/components/PageLoadingProvider';
import { VisitedPageTabs } from '@/navigation/components/VisitedPageTabs';
import { navigationPanelOpenState } from '@/navigation/states/navigationPanelState';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { Sidebar, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Outlet } from 'react-router';

export const DefaultLayout = () => {
  const [panelOpen, setPanelOpen] = useAtom(navigationPanelOpenState);
  const [inPreview] = useQueryState<boolean>('inPreview');

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <Sidebar.Provider
      className="w-screen"
      open={panelOpen}
      onOpenChange={setPanelOpen}
      sidebarKeyboardShortcut={false}
      sidebarWidth="19.5rem"
      sidebarWidthIcon="3.5rem"
    >
      <VisitedPageTabs />
      <Sidebar collapsible="icon" variant="sidebar" className="p-0 pt-12">
        <MainNavigationBar />
      </Sidebar>
      <Sidebar.Inset className="h-svh grow-0 shrink basis-full overflow-hidden pt-12 shadow-sidebar-inset">
        <FloatingWidgets />
        <PageLoadingProvider>
          <Outlet />
        </PageLoadingProvider>
      </Sidebar.Inset>
    </Sidebar.Provider>
  );
};

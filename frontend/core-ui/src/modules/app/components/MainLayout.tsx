import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
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
      sidebarWidth="19rem"
    >
      <VisitedPageTabs />
      <Sidebar collapsible="icon" variant="sidebar" className="p-0 pt-10">
        <MainNavigationBar />
      </Sidebar>
      <Sidebar.Inset className="h-svh grow-0 shrink basis-full overflow-hidden pt-10 shadow-sidebar-inset">
        <FloatingWidgets />
        <Outlet />
      </Sidebar.Inset>
    </Sidebar.Provider>
  );
};

import { WelcomeNotificationEffect } from '@/app/effect-components/WelcomeNotificationEffect';
import { HomeSidebar } from '@/home/components/HomeSidebar';
import { isHomePath } from '@/home/utils/isHomePath';
import { AppBar } from '@/navigation/components/AppBar';
import { AppSidebar } from '@/navigation/components/AppSidebar';
import { useRememberAppPlace } from '@/navigation/hooks/useAppPlaces';
import {
  getSectionKey,
  PAGE_ENTER_KEYFRAMES,
  useEnterAnimation,
} from '@/navigation/hooks/useEnterAnimation';
import { useAppTheme } from '@/navigation/hooks/useAppTheme';
import { useCurrentApp } from '@/navigation/hooks/useCurrentApp';
import { navigationSidebarOpenState } from '@/navigation/states/navigationPanelState';
import { GlobalSearch } from '@/search/components/GlobalSearch';
import { AppPath } from '@/types/paths/AppPath';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { Sidebar, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

const AppSheet = () => {
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEnterAnimation(pageRef, getSectionKey(pathname), PAGE_ENTER_KEYFRAMES);

  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col pt-12">
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <FloatingWidgets />
        <div
          ref={pageRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(navigationSidebarOpenState);
  const [inPreview] = useQueryState<boolean>('inPreview');
  const { pathname } = useLocation();
  const app = useCurrentApp();

  useRememberAppPlace();
  useAppTheme(app);

  if (inPreview) {
    return <Outlet />;
  }

  const isHome = isHomePath(pathname);
  const withSidebar =
    isHome || !!app || pathname.startsWith(`/${AppPath.Settings}`);

  return (
    <Sidebar.Provider
      className="w-screen bg-sidebar"
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      sidebarKeyboardShortcut={false}
      sidebarWidth="15rem"
    >
      <GlobalSearch />
      <WelcomeNotificationEffect />
      <AppBar withSidebar={withSidebar} />
      {withSidebar && (
        <Sidebar
          collapsible="offcanvas"
          variant="sidebar"
          className="top-12 h-[calc(100svh-3rem)]!"
        >
          {isHome ? <HomeSidebar /> : <AppSidebar />}
        </Sidebar>
      )}
      <AppSheet />
    </Sidebar.Provider>
  );
};

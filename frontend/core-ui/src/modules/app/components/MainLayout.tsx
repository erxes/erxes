import { Sidebar, cn, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';

import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { GlobalSearch } from '@/search/components/GlobalSearch';
import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { MobileNavigationTrigger } from '@/navigation/components/MobileNavigationTrigger';
import { NavigationContextPanel } from '@/navigation/components/navigation-activity-rail/NavigationContextPanel';
import {
  getSectionKey,
  PAGE_ENTER_KEYFRAMES,
  useEnterAnimation,
} from '@/navigation/hooks/useEnterAnimation';
import { VisitedPageTabs } from '@/navigation/components/visited-page-tabs/VisitedPageTabs';
import { VisitedPageTabsOpenButton } from '@/navigation/components/visited-page-tabs/VisitedPageTabsOpenButton';
import {
  navigationResizingState,
  navigationSidebarOpenState,
  navigationSidebarWidthState,
} from '@/navigation/states/navigationPanelState';
import { type ReactNode, lazy, Suspense, useRef } from 'react';
import { agentSidePanelOpenState } from '@/agent/states/agentPanelStates';
import { Outlet, useLocation } from 'react-router';
import { WelcomeNotificationEffect } from '@/app/effect-components/WelcomeNotificationEffect';
import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';

// Lazy: keeps the agent chat bundle (ai SDK, markdown, artifact
// converters) out of the main chunk until the panel first opens.
const AgentSidePanel = lazy(() =>
  import('@/agent/components/AgentSidePanel').then((module) => ({
    default: module.AgentSidePanel,
  })),
);

// Lazy too: the tray pulls in the vendored bot engine, which nobody
// needs before first paint.
const AgentTray = lazy(() =>
  import('@/agent/components/AgentTray').then((module) => ({
    default: module.AgentTray,
  })),
);

const AgentTrayMount = () => (
  <Suspense fallback={null}>
    <AgentTray />
  </Suspense>
);

// Gate first, then lazy: the agent chunk only loads when the panel is
// actually opened, not on app start. Once opened the panel stays mounted
// (hidden when closed) so its chat stream — and the tray's activity
// feed — keeps running; it never mounts on `/agent*` where the full
// page owns the chat.
const AgentPanelMount = () => {
  const open = useAtomValue(agentSidePanelOpenState);
  const { pathname } = useLocation();
  const everOpenedRef = useRef(open);

  if (open) {
    everOpenedRef.current = true;
  }

  if (!everOpenedRef.current || pathname.startsWith('/agent')) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AgentSidePanel />
    </Suspense>
  );
};

const NavigationWorkspace = () => {
  const { isMobile } = Sidebar.useSidebar();
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEnterAnimation(pageRef, getSectionKey(pathname), PAGE_ENTER_KEYFRAMES);

  return (
    <Sidebar.Inset
      className={cn(
        'h-svh grow-0 shrink basis-full overflow-hidden shadow-sidebar-inset',
        tabsVisible && 'pt-10',
      )}
    >
      <div className="relative flex min-h-0 flex-1 has-[>[data-navigation-context-toggle]]:[--navigation-panel-toggle-space:2.5rem]">
        {!isMobile && <NavigationContextPanel />}
        <div
          className={cn(
            'relative flex min-w-0 flex-1 flex-col overflow-hidden',
            isMobile &&
              '[--navigation-panel-toggle-space:2.5rem] [--navigation-top-controls-space:2.25rem]',
            !tabsVisible &&
              '[--visited-page-tabs-open-button-space:2.75rem] [--navigation-top-controls-space:2.25rem]',
          )}
        >
          <MobileNavigationTrigger />
          <VisitedPageTabsOpenButton />
          <FloatingWidgets />
          <div
            ref={pageRef}
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            <Outlet />
          </div>
        </div>
        <AgentPanelMount />
        <AgentTrayMount />
      </div>
    </Sidebar.Inset>
  );
};

const NavigationSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useAtom(navigationSidebarOpenState);
  const sidebarWidth = useAtomValue(navigationSidebarWidthState);
  const resizing = useAtomValue(navigationResizingState);

  return (
    <Sidebar.Provider
      className={cn(
        'w-screen',
        resizing && 'cursor-col-resize select-none **:transition-none!',
      )}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      sidebarKeyboardShortcut={false}
      sidebarWidth={sidebarWidth ? `${sidebarWidth}px` : '15rem'}
      sidebarWidthIcon="3rem"
    >
      {children}
    </Sidebar.Provider>
  );
};

export const DefaultLayout = () => {
  const [inPreview] = useQueryState<boolean>('inPreview');
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <NavigationSidebarProvider>
      <VisitedPageTabs />
      <GlobalSearch />
      <WelcomeNotificationEffect />
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className={cn('p-0', tabsVisible && 'pt-10')}
      >
        <MainNavigationBar />
      </Sidebar>
      <NavigationWorkspace />
    </NavigationSidebarProvider>
  );
};

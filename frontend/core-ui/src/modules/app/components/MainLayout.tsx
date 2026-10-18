import { cn, Sidebar, useQueryState } from 'erxes-ui';

import { CoreAppOutlet } from '@/app/components/CoreAppOutlet';
import { CoreTab } from '@/navigation/components/core-tab/CoreTab';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { GlobalSearch } from '@/search/components/GlobalSearch';
import {
  getAppKey,
  PAGE_ENTER_KEYFRAMES,
  useEnterAnimation,
} from '@/navigation/hooks/useEnterAnimation';
import { lazy, Suspense, useRef } from 'react';
import { useAtomValue } from 'jotai';
import {
  agentSidePanelOpenState,
  agentSidePanelResizingState,
} from '@/agent/states/agentPanelStates';
import { Outlet, useLocation } from 'react-router';
import { WelcomeNotificationEffect } from '@/app/effect-components/WelcomeNotificationEffect';

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

const AppWorkspace = () => {
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEnterAnimation(pageRef, getAppKey(pathname), PAGE_ENTER_KEYFRAMES);

  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <div
        ref={pageRef}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <FloatingWidgets />
        <CoreAppOutlet />
      </div>
      <AgentPanelMount />
    </main>
  );
};

export const DefaultLayout = () => {
  const [inPreview] = useQueryState<boolean>('inPreview');
  const resizing = useAtomValue(agentSidePanelResizingState);

  if (inPreview) {
    return <Outlet />;
  }

  // Core draws no sidebar; the provider only backs Sidebar.* parts used on
  // pages without an AppLayout (apps nest their own provider).
  return (
    <Sidebar.Provider
      className={cn(
        'h-svh w-screen flex-col overflow-hidden',
        resizing && 'cursor-col-resize select-none **:transition-none!',
      )}
      sidebarKeyboardShortcut={false}
    >
      <GlobalSearch />
      <WelcomeNotificationEffect />
      <CoreTab />
      <AppWorkspace />
      <AgentTrayMount />
    </Sidebar.Provider>
  );
};

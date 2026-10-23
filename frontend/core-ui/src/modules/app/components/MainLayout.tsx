import { Sidebar, useQueryState } from 'erxes-ui';

import { CoreAppOutlet } from '@/app/components/CoreAppOutlet';
import { CoreTab } from '@/navigation/components/core-tab/CoreTab';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { GlobalSearch } from '@/search/components/GlobalSearch';
import {
  SidePanelLayout,
  SidePanelRecord,
} from '@/side-panel/components/SidePanelLayout';
import { RecordViewContext } from 'ui-modules';
import {
  getAppKey,
  PAGE_ENTER_KEYFRAMES,
  useEnterAnimation,
} from '@/navigation/hooks/useEnterAnimation';
import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { WelcomeNotificationEffect } from '@/app/effect-components/WelcomeNotificationEffect';

const AppWorkspace = () => {
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEnterAnimation(pageRef, getAppKey(pathname), PAGE_ENTER_KEYFRAMES);

  return (
    <main
      ref={pageRef}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background"
    >
      <FloatingWidgets />
      <CoreAppOutlet />
    </main>
  );
};

export const DefaultLayout = () => {
  const [inPreview] = useQueryState<boolean>('inPreview');

  if (inPreview) {
    return <Outlet />;
  }

  // Core draws no sidebar; the provider only backs Sidebar.* parts used on
  // pages without an AppLayout (apps nest their own provider). The side
  // panel runs the full window height, beside the top bar too.
  return (
    <RecordViewContext.Provider value={SidePanelRecord}>
      <Sidebar.Provider
        className="h-svh w-screen overflow-hidden"
        sidebarKeyboardShortcut={false}
      >
        <GlobalSearch />
        <WelcomeNotificationEffect />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <CoreTab />
          <AppWorkspace />
        </div>
        <SidePanelLayout />
      </Sidebar.Provider>
    </RecordViewContext.Provider>
  );
};

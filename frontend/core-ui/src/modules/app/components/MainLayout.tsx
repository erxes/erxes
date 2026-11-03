import { Button, Sidebar, useQueryState } from 'erxes-ui';

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
import { SupportAccessBanner } from '@/settings/support-access/components/SupportAccessBanner';
import { useTranslation } from 'react-i18next';

const MAIN_CONTENT_ID = 'main-content';

const SkipToMainContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <Button
      asChild
      variant="outline"
      className="fixed top-2 left-2 z-50 -translate-y-12 focus:translate-y-0"
    >
      <a
        href={`#${MAIN_CONTENT_ID}`}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(MAIN_CONTENT_ID)?.focus();
        }}
      >
        {t('skip-to-main-content')}
      </a>
    </Button>
  );
};

const AppWorkspace = () => {
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEnterAnimation(pageRef, getAppKey(pathname), PAGE_ENTER_KEYFRAMES);

  return (
    <main
      id={MAIN_CONTENT_ID}
      ref={pageRef}
      tabIndex={-1}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background outline-none"
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
        <SkipToMainContent />
        <GlobalSearch />
        <WelcomeNotificationEffect />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <SupportAccessBanner />
          <CoreTab />
          <AppWorkspace />
        </div>
        <SidePanelLayout />
      </Sidebar.Provider>
    </RecordViewContext.Provider>
  );
};

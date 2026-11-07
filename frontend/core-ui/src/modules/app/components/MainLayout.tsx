import { Button, Sidebar, cn, useQueryState } from 'erxes-ui';

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
import { CSSProperties, useRef } from 'react';
import { useAtomValue } from 'jotai';
import {
  appearanceLayoutState,
  NOTCH_COLORS,
  notchColorState,
} from '@/app/states/appearanceState';
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
  const layout = useAtomValue(appearanceLayoutState);
  const notchColor = useAtomValue(notchColorState);
  const isNotch = layout === 'notch';

  if (inPreview) {
    return <Outlet />;
  }

  // Core draws no sidebar; the provider only backs Sidebar.* parts used on
  // pages without an AppLayout (apps nest their own provider). The side
  // panel sits below the top bar, beside the workspace. The notch layout puts
  // the top bar on a colored frame; top bar parts style it via group/layout.
  return (
    <RecordViewContext.Provider value={SidePanelRecord}>
      <Sidebar.Provider
        className={cn(
          'group/layout h-svh w-screen overflow-hidden',
          isNotch && 'bg-(--notch-frame)',
        )}
        data-notch={isNotch}
        style={
          isNotch
            ? ({ '--notch-frame': NOTCH_COLORS[notchColor] } as CSSProperties)
            : undefined
        }
        sidebarKeyboardShortcut={false}
      >
        <SkipToMainContent />
        <GlobalSearch />
        <WelcomeNotificationEffect />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {!isNotch && <SupportAccessBanner />}
          <CoreTab />
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
              isNotch && 'mx-2 mb-2 rounded-md bg-background shadow-sm',
            )}
          >
            {isNotch && <SupportAccessBanner />}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
              <AppWorkspace />
              <SidePanelLayout />
            </div>
          </div>
        </div>
      </Sidebar.Provider>
    </RecordViewContext.Provider>
  );
};

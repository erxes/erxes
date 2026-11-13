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
import { useRef } from 'react';
import {
  AppearanceLayout,
  NavPosition,
  resolveFrameStyle,
} from '@/app/constants/appearance';
import { FrameBackdrop } from '@/app/components/FrameBackdrop';
import { GlobalSidebar } from '@/global-sidebar/components/GlobalSidebar';
import { useAppearanceValue } from '@/app/hooks/useAppearance';
import { Outlet, useLocation } from 'react-router';
import { WelcomeNotificationEffect } from '@/app/effect-components/WelcomeNotificationEffect';
import { SupportAccessBanner } from '@/settings/support-access/components/SupportAccessBanner';
import { useTranslation } from 'react-i18next';

const MAIN_CONTENT_ID = 'main-content';

// The card keeps a gap on every frame edge except the one the navigation is on.
const FRAMED_CARD_MARGINS: Record<
  Exclude<AppearanceLayout, 'default'>,
  Record<NavPosition, string>
> = {
  notch: { start: 'mx-2 mb-2', end: 'mx-2 mt-2' },
  sidebar: { start: 'my-2 mr-2', end: 'my-2 ml-2' },
};

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
  const { layout, frameColor, navPosition } = useAppearanceValue();
  const isSidebar = layout === 'sidebar';
  const isFramed = layout !== 'default';
  const isEnd = isFramed && navPosition === 'end';
  const frame = isFramed ? resolveFrameStyle(frameColor) : null;

  if (inPreview) {
    return <Outlet />;
  }

  // Core draws no app sidebar; the provider only backs Sidebar.* parts used
  // on pages without an AppLayout (apps nest their own provider). The side
  // panel sits beside the workspace. Framed layouts (notch, sidebar) put core
  // navigation on a colored frame, styled via group/layout, and inset the app
  // as a card.
  return (
    <RecordViewContext.Provider value={SidePanelRecord}>
      <Sidebar.Provider
        className="group/layout relative h-svh w-screen overflow-hidden"
        data-framed={isFramed}
        sidebarKeyboardShortcut={false}
      >
        {frame && <FrameBackdrop frame={frame} />}
        <SkipToMainContent />
        <GlobalSearch />
        <WelcomeNotificationEffect />
        <div
          className={cn(
            'relative flex min-w-0 flex-1 overflow-hidden',
            isSidebar && isEnd && 'flex-row-reverse',
            !isSidebar && (isEnd ? 'flex-col-reverse' : 'flex-col'),
          )}
        >
          {!isFramed && <SupportAccessBanner />}
          <CoreTab
            orientation={isSidebar ? 'vertical' : 'horizontal'}
            position={isEnd ? 'end' : 'start'}
          />
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
              isFramed && 'rounded-md bg-background shadow-sm',
              layout !== 'default' && FRAMED_CARD_MARGINS[layout][navPosition],
            )}
          >
            {isFramed && <SupportAccessBanner />}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
              <AppWorkspace />
              <SidePanelLayout />
              <GlobalSidebar />
            </div>
          </div>
        </div>
      </Sidebar.Provider>
    </RecordViewContext.Provider>
  );
};

import { ListViewsProvider, Sidebar } from 'erxes-ui';
import { type PropsWithChildren, Suspense } from 'react';
import { PageOutlet } from '~/components/CrashBoundary';
import { lazyNamed } from '~/lib/lazyNamed';
import { useLiveUpdates } from '~/lib/live';
import { AssistantHost } from '~/modules/assistant/AssistantHost';
import { useDesktopNotifications } from '~/modules/notifications/useDesktopNotifications';
import { useImportantToasts } from '~/modules/notifications/useImportantToasts';
import { usePluginTranslations } from '~/modules/plugins/pluginText';
import { CoreTab } from '~/modules/navigation/CoreTab';
import { PlanBanner } from '~/modules/saas/PlanBanner';
import { SupportBanner } from '~/modules/saas/SupportBanner';
import { useSettingsReturn } from '~/modules/settings/components/SettingsSidebar';
import { PanelRecordOpener } from '~/modules/side-panel/PanelRecordOpener';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';
import { LIST_VIEWS } from '~/modules/views/listViews';

/** Plugins' floating widgets, a chunk of their own so the shell stays as small. */
const PluginFloatingWidgets = lazyNamed(
  () => import('~/modules/plugins/PluginFloatingWidgets'),
  'PluginFloatingWidgets',
);

/** What pages, core's and plugins',and plugins' floating widgets draw inside. */
const PageProviders = ({ children }: PropsWithChildren) => (
  <ListViewsProvider views={LIST_VIEWS}>
    <PanelRecordOpener>{children}</PanelRecordOpener>
  </ListViewsProvider>
);

/**
 * The signed-in frame: the top bar, then the open
 * app, which draws its own sidebar (AppLayout) or, for plugins, everything. Plugins' floating
 * widgets sit beside it, so a navigation keeps them mounted.
 */
export const MainLayout = () => {
  // Inbox and timelines update as changes happen (one stream per browser).
  useLiveUpdates();
  // New inbox items as desktop notifications, when the member turned them on.
  useDesktopNotifications();
  // Important ones arriving now as a toast too.
  useImportantToasts();
  useSettingsReturn();
  // Plugins' words from their manifests, in the member's language.
  usePluginTranslations();

  return (
    <Sidebar.Provider
      className="relative h-svh w-full overflow-hidden"
      sidebarKeyboardShortcut={false}
    >
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <CoreTab />
        <PlanBanner />
        <SupportBanner />
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <main
            id="main-content"
            tabIndex={-1}
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background outline-none"
          >
            <PageProviders>
              <PageOutlet />
            </PageProviders>
          </main>
          <SidePanelLayout />
          <AssistantHost />
        </div>
      </div>
      <PageProviders>
        <Suspense fallback={null}>
          <PluginFloatingWidgets />
        </Suspense>
      </PageProviders>
    </Sidebar.Provider>
  );
};

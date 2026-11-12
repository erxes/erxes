import { Sidebar } from 'erxes-ui';
import { Outlet } from 'react-router-dom';
import { useLiveUpdates } from '~/lib/live';
import { useDesktopNotifications } from '~/modules/notifications/useDesktopNotifications';
import { CoreTab } from '~/modules/navigation/CoreTab';
import { PlanBanner } from '~/modules/saas/PlanBanner';
import { SidePanelLayout } from '~/modules/side-panel/SidePanelLayout';

/**
 * The signed-in frame (old core-ui DefaultLayout): the top bar, then the open
 * app, which draws its own sidebar (AppLayout) or, for plugins, everything.
 */
export const MainLayout = () => {
  // Inbox and timelines update as changes happen (one stream per browser).
  useLiveUpdates();
  // New inbox items as desktop notifications, when the member turned them on.
  useDesktopNotifications();

  return (
    <Sidebar.Provider
      className="relative h-svh w-screen overflow-hidden"
      sidebarKeyboardShortcut={false}
    >
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <CoreTab />
        <PlanBanner />
        {/* The record side panel sits beside the page, as in old core-ui. */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <main
            id="main-content"
            tabIndex={-1}
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background outline-none"
          >
            <Outlet />
          </main>
          <SidePanelLayout />
        </div>
      </div>
    </Sidebar.Provider>
  );
};

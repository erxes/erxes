import { Sidebar } from 'erxes-ui';
import { Outlet } from 'react-router-dom';
import { CoreTab } from '~/modules/navigation/CoreTab';

/**
 * The signed-in frame (old core-ui DefaultLayout): the top bar, then the open
 * app, which draws its own sidebar (AppLayout) or, for plugins, everything.
 */
export const MainLayout = () => (
  <Sidebar.Provider className="relative h-svh w-screen overflow-hidden" sidebarKeyboardShortcut={false}>
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <CoreTab />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background outline-none"
      >
        <Outlet />
      </main>
    </div>
  </Sidebar.Provider>
);

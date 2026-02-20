import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { Sidebar, useQueryState } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { Outlet, useLocation } from 'react-router-dom';
import { mainSidebarOpenState } from '../states/mainSidebarState';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';

export const DefaultLayout = () => {
  const location = useLocation();
  const isSettings = location.pathname.includes('/settings');
  const [mainSidebarOpen, setMainSidebarOpen] = useAtom(mainSidebarOpenState);
  const [inPreview] = useQueryState<boolean>('inPreview');

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <Sidebar.Provider
      className="w-screen"
      open={mainSidebarOpen}
      onOpenChange={setMainSidebarOpen}
    >
      <Sidebar collapsible="offcanvas" variant="sidebar" className="p-0">
        <SidebarAnimationContainer isSettings={isSettings}>
          {isSettings ? <SettingsSidebar /> : <MainNavigationBar />}
        </SidebarAnimationContainer>
        <Sidebar.Rail />
      </Sidebar>
      <Sidebar.Inset className="h-[calc(100svh-(--spacing(4)))] grow-0 shrink basis-full overflow-hidden shadow-sidebar-inset">
        <FloatingWidgets />
        <Outlet />
      </Sidebar.Inset>
    </Sidebar.Provider>
  );
};

export const SidebarAnimationContainer = ({
  children,
  isSettings,
}: {
  children: React.ReactNode;
  isSettings: boolean;
}) => {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={isSettings ? 'settings' : 'main'}
        initial={{ x: isSettings ? 20 : -20 }}
        animate={{ x: 0 }}
        transition={{ damping: 0 }}
        className="flex h-full w-full flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

import { Outlet, useLocation } from 'react-router';
import { Sidebar, useQueryState } from 'erxes-ui';
import { useEffect, useRef } from 'react';

import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { mainSidebarCollapseState } from '../states/mainSidebarState';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';

export const DefaultLayout = () => {
  const location = useLocation();
  const isSettings = location.pathname.includes('/settings');
  const [collapseState, setCollapseState] = useAtom(mainSidebarCollapseState);
  const [inPreview] = useQueryState<boolean>('inPreview');

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <Sidebar.Provider
      className="w-screen"
      collapseState={collapseState}
      onCollapseStateChange={setCollapseState}
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
  const isFirstMount = useRef(true);
  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  return (
    <motion.div
      key={isSettings ? 'settings' : 'main'}
      initial={isFirstMount.current || !isSettings ? false : { x: 20 }}
      animate={{ x: 0 }}
      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
      className="flex h-full w-full flex-col"
    >
      {children}
    </motion.div>
  );
};

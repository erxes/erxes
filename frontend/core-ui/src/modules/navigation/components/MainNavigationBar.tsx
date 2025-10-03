import { Sidebar } from 'erxes-ui';
import { Organization } from './Organization';
import { SidebarNavigationFavorites } from './SidebarNavigationFavorites';
import { NavigationCoreModules } from '@/navigation/components/NavigationCoreModules';
import {
  NavigationPluginExitButton,
  NavigationPlugins,
} from '@/navigation/components/NavigationPlugins';
import { lazy } from 'react';

const SHOW_COMPONENTS = false;

export const DevelopmentNavigation = lazy(() =>
  import('./DevelopmentMenus').then((m) => ({
    default: m.DevelopmentNavigation,
  })),
);

export const MainNavigationBar = () => {
  return (
    <>
      <Sidebar.Header className="px-2 h-[3.25rem] justify-center">
        <Sidebar.Menu>
          <Sidebar.MenuItem className="flex gap-2 items-center">
            <Organization />
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Separator className="mx-0" />
      <Sidebar.Content className="gap-0">
        <NavigationPluginExitButton />
        {process.env.NODE_ENV === 'development' && SHOW_COMPONENTS && (
          <DevelopmentNavigation />
        )}
        <SidebarNavigationFavorites />
        <NavigationPlugins />
        <NavigationCoreModules />
      </Sidebar.Content>
    </>
  );
};

export default MainNavigationBar;

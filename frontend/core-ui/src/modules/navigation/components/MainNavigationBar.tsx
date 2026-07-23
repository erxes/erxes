import { Sidebar } from 'erxes-ui';
import { SidebarNavigationFavorites } from './SidebarNavigationFavorites';
import { NavigationCoreModules } from '@/navigation/components/NavigationCoreModules';
import {
  NavigationPluginExitButton,
  NavigationPlugins,
} from '@/navigation/components/NavigationPlugins';
import { lazy } from 'react';
import { NavigationPanelHeader } from '@/navigation/components/NavigationPanelHeader';

const SHOW_COMPONENTS = false;

export const DevelopmentNavigation = lazy(() =>
  import('./DevelopmentMenus').then((m) => ({
    default: m.DevelopmentNavigation,
  })),
);

interface MainNavigationBarProps {
  onCollapse: () => void;
}

export const MainNavigationBar = ({ onCollapse }: MainNavigationBarProps) => {
  return (
    <>
      <NavigationPanelHeader onCollapse={onCollapse} />
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

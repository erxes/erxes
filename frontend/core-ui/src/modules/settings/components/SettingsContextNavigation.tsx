import { findActiveNavigationPath } from '@/navigation/utils/navigationPathMatch';
import { getNavigationPlacement } from '@/navigation/utils/navigationPlacement';
import { findSettingsSubNavigation } from '@/settings/constants/data';
import { useSettingsSubNavigation } from '@/settings/hooks/useSettingsSubNavigation';
import { NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

export const SettingsContextNavigation = () => {
  const location = useLocation();
  const { state } = Sidebar.useSidebar();
  const subNavigation = useSettingsSubNavigation();
  const entry = findSettingsSubNavigation(subNavigation, location.pathname);

  if (
    !entry ||
    (state === 'expanded' &&
      getNavigationPlacement(entry.items.length) === 'inline')
  ) {
    return null;
  }

  const activePath = findActiveNavigationPath(
    entry.items.map((item) => item.path),
    location,
  );

  return (
    <NavigationMenuGroup name={entry.name}>
      {entry.items.map((item) => (
        <Sidebar.MenuItem key={item.path}>
          <Sidebar.MenuButton asChild isActive={item.path === activePath}>
            <Link to={item.path}>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
            </Link>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      ))}
    </NavigationMenuGroup>
  );
};

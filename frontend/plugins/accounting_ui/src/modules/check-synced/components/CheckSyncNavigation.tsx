import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useLocation } from 'react-router';
import { ACC_TR_CHECK_ROUTES } from '../constants/settingsRoutes';

export const CheckSyncNavigation = () => {
  const { pathname } = useLocation();

  if (!pathname.startsWith('/accounting/check-sync')) {
    return null;
  }

  return (
    <NavigationMenuGroup name="Мэдээ таталт">
      {Object.entries(ACC_TR_CHECK_ROUTES).map(([path, label]) => (
        <NavigationMenuLinkItem key={path} name={label} path={path} />
      ))}
    </NavigationMenuGroup>
  );
};

import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ACC_TR_CHECK_ROUTES } from '../constants/settingsRoutes';

export const CheckSyncNavigation = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();

  if (!pathname.startsWith('/accounting/check-sync')) {
    return null;
  }

  return (
    <NavigationMenuGroup name={t('data-synchronization')}>
      {Object.entries(ACC_TR_CHECK_ROUTES).map(([path, label]) => (
        <NavigationMenuLinkItem key={path} name={t(label)} path={path} />
      ))}
    </NavigationMenuGroup>
  );
};

import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  INVENTORY_SETTINGS_ROUTES,
  SETTINGS_ROUTES,
} from '../constants/settingsRoutes';

const routes = { ...SETTINGS_ROUTES, ...INVENTORY_SETTINGS_ROUTES };

const routeLabel = (pathname: string) =>
  routes[pathname as keyof typeof routes] || '';

export const AccountSettingsBreadcrumb = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
        {pathname.startsWith('/settings/accounting/inventories')
          ? 'Бараа материал'
          : t('accounting-settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {routeLabel(pathname)}
      </Button>
    </>
  );
};

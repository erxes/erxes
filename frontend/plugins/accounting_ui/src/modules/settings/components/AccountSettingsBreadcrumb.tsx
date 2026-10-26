import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  FIXED_ASSET_SETTINGS_ROUTES,
  INVENTORY_SETTINGS_ROUTES,
  SETTINGS_ROUTES,
} from '@/settings/constants/settingsRoutes';

const ROUTES = [
  ...SETTINGS_ROUTES,
  ...FIXED_ASSET_SETTINGS_ROUTES,
  ...INVENTORY_SETTINGS_ROUTES,
];

export const AccountSettingsBreadcrumb = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  const route = ROUTES.find(({ path }) => `/${path}` === pathname);
  const isInventory = pathname.startsWith('/accounting/settings/inventories');

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button variant="ghost" className="shrink-0">
        <IconCashBanknote />
        <span className="hidden sm:inline">
          {isInventory ? t('inventory') : t('accounting-settings')}
        </span>
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="min-w-0 hover:bg-transparent">
        <span className="truncate">{route && t(route.name)}</span>
      </Button>
    </div>
  );
};

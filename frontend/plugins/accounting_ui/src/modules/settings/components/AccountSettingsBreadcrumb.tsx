import {
  IconBuildingWarehouse,
  IconCashBanknote,
  IconPackages,
} from '@tabler/icons-react';
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

const SECTIONS = [
  {
    pathPrefix: '/accounting/settings/fixed-assets',
    name: 'fixed-asset',
    icon: IconBuildingWarehouse,
  },
  {
    pathPrefix: '/accounting/settings/inventories',
    name: 'inventory',
    icon: IconPackages,
  },
];

export const AccountSettingsBreadcrumb = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  const route = ROUTES.find(({ path }) => `/${path}` === pathname);
  const section = SECTIONS.find(({ pathPrefix }) =>
    pathname.startsWith(pathPrefix),
  );
  const SectionIcon = section?.icon ?? IconCashBanknote;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button variant="ghost" className="shrink-0">
        <SectionIcon />
        <span className="hidden sm:inline">
          {section ? t(section.name) : t('accounting-settings')}
        </span>
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="min-w-0 hover:bg-transparent">
        <span className="truncate">{route && t(route.name)}</span>
      </Button>
    </div>
  );
};

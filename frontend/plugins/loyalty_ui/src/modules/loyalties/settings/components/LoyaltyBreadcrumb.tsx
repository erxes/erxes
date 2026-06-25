import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '../constants/settingRoutes';

export const LoyaltyBreadcrumb = () => {
  const { t } = useTranslation('loyalty');
  const { pathname } = useLocation();
  const normalizePath = (value: string) => value.replace(/\/+$/, '');
  const label =
    SETTINGS_ROUTES[normalizePath(pathname) as keyof typeof SETTINGS_ROUTES];
  return (
    <div className="flex items-center w-full justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="font-semibold">
          <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
          {t('settings')}
        </Button>
        <Separator.Inline />
        <Button variant="ghost" className="font-semibold">
          {label ? t(label) : ''}
        </Button>
      </div>
    </div>
  );
};

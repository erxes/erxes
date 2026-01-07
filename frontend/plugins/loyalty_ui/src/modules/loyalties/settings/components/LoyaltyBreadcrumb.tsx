import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '../constants/settingRoutes';
import { LoyaltyScoreAddHeader } from '../score/components/LoyaltyScoreAddHeader';

export const LoyaltyBreadcrumb = () => {
  const { pathname } = useLocation();
  const normalizePath = (value: string) => value.replace(/\/+$/, '');
  const label =
    SETTINGS_ROUTES[normalizePath(pathname) as keyof typeof SETTINGS_ROUTES];
  return (
    <div className="flex items-center w-full justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="font-semibold">
          <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
          Settings
        </Button>
        <Separator.Inline />
        <Button variant="ghost" className="hover:bg-transparent font-semibold">
          {label}
        </Button>
      </div>
      <LoyaltyScoreAddHeader />
    </div>
  );
};

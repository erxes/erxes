import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { SETTINGS_ROUTES } from '@/ebarimt/settings/constants/settingRoutes';

export const EBarimtBreadcrumb = () => {
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
        Settings
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {SETTINGS_ROUTES[pathname as keyof typeof SETTINGS_ROUTES]}
      </Button>
    </>
  );
};

import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '@/ebarimt/settings/constants/settingRoutes';

export const EBarimtBreadcrumb = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('mongolian');
  return (
    <>
      <Button variant="ghost">
        <IconCashBanknote />
        {t('settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent">
        {t(SETTINGS_ROUTES[pathname as keyof typeof SETTINGS_ROUTES])}
      </Button>
    </>
  );
};

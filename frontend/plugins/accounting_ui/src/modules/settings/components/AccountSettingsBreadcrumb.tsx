import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '../constants/settingsRoutes';

export const AccountSettingsBreadcrumb = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost">
        <IconCashBanknote />
        {t('accounting-settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent">
        {t(SETTINGS_ROUTES[pathname as keyof typeof SETTINGS_ROUTES] ?? '')}
      </Button>
    </>
  );
};

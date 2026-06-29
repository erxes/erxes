import { Button, Separator } from 'erxes-ui';
import { IconCashBanknote } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SYNC_ERKHET_ROUTES } from './SyncErkhetRoutes';

export const SyncErkhetBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCashBanknote className="w-4 h-4 mr-1.5" />
        {t('erkhet-sync')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {t(SYNC_ERKHET_ROUTES.find((r) => pathname.endsWith(r.value))?.label ?? '')}
      </Button>
    </>
  );
};

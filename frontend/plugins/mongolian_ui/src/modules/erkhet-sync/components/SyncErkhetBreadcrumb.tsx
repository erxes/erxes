import { Separator } from 'erxes-ui';
import { IconCashBanknote } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SYNC_ERKHET_ROUTES } from './SyncErkhetRoutes';

export const SyncErkhetBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const currentRoute = SYNC_ERKHET_ROUTES.find((r) => pathname.endsWith(r.value));
  return (
    <>
      <span className="font-semibold inline-flex items-center">
        <IconCashBanknote className="w-4 h-4 mr-1.5" />
        {t('erkhet-sync')}
      </span>
      <Separator.Inline />
      <span className="font-semibold" aria-current="page">
        {t(currentRoute?.label ?? '')}
      </span>
    </>
  );
};

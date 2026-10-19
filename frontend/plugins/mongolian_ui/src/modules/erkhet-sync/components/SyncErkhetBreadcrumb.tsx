import { Button, Separator } from 'erxes-ui';
import { IconCashBanknote } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SYNC_ERKHET_ROUTES } from './SyncErkhetRoutes';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const SyncErkhetBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const currentRoute = SYNC_ERKHET_ROUTES.find((r) =>
    pathname.endsWith(r.value),
  );
  const currentLabel = t(currentRoute?.label ?? '');
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('erkhet-sync'),
    currentLabel,
  );

  return (
    <>
      <Button variant="ghost">
        <IconCashBanknote className="w-4 h-4 mr-1.5" />
        {t('erkhet-sync')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost">{currentLabel}</Button>
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton
        breadcrumb={favoriteBreadcrumb}
        icon="IconCashBanknote"
      />
    </>
  );
};

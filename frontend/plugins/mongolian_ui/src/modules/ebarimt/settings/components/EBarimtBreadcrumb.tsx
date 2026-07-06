import { IconCashBanknote } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SETTINGS_ROUTES } from '@/ebarimt/settings/constants/settingRoutes';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const EBarimtBreadcrumb = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('mongolian');
  const currentPath = pathname.split('/').pop() || '';
  const currentLabel = t(
    SETTINGS_ROUTES[currentPath as keyof typeof SETTINGS_ROUTES] ||
      SETTINGS_ROUTES[''],
  );
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('settings'),
    currentLabel,
  );

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCashBanknote className="w-4 h-4 text-accent-foreground" />
        {t('settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {currentLabel}
      </Button>
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton
        breadcrumb={favoriteBreadcrumb}
        icon="IconSandbox"
      />
    </>
  );
};

import { Button, Separator } from 'erxes-ui';
import { IconSandbox } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MSDYNAMIC_ROUTES } from './MSDynamicRoutes';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const MSDynamicBreadCrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const currentLabel = t(
    MSDYNAMIC_ROUTES.find((r) => pathname.includes(r.value))?.label ?? '',
  );
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('ms-dynamic'),
    currentLabel,
  );

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconSandbox className="w-4 h-4 mr-1.5" />
        {t('ms-dynamic')}
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

import { Button, Separator } from 'erxes-ui';
import { IconSandbox } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PUT_RESPONSE_ROUTES } from './PutResponseRoutes';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const PutResponseBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const { pathname } = useLocation();
  const rootLabel = t('put-response');
  const currentLabel = t(
    PUT_RESPONSE_ROUTES.find((r) => pathname.endsWith(r.value))?.label ?? '',
  );
  const hasCurrentSegment = currentLabel && currentLabel !== rootLabel;
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    rootLabel,
    hasCurrentSegment && currentLabel,
  );

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconSandbox className="w-4 h-4 mr-1.5" />
        {rootLabel}
      </Button>
      {hasCurrentSegment && (
        <>
          <Separator.Inline />
          <Button
            variant="ghost"
            className="hover:bg-transparent font-semibold"
          >
            {currentLabel}
          </Button>
        </>
      )}
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton
        breadcrumb={favoriteBreadcrumb}
        icon="IconSandbox"
      />
    </>
  );
};

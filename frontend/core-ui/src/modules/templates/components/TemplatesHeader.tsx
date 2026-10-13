import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const TemplatesHeader = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('templates'));

  return (
    <PageHeader>
      <PageHeader.Start>
        <TemplatesBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconBrandDatabricks"
        />
      </PageHeader.Start>
    </PageHeader>
  );
};

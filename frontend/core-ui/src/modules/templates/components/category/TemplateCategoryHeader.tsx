import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { TemplateCategoryAddSheet } from './TemplateCategoryAddSheet';
import { useTranslation } from 'react-i18next';

export const TemplateCategoryHeader = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });

  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('templates'),
    t('categories'),
  );

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

      <PageHeader.End>
        <TemplateCategoryAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};

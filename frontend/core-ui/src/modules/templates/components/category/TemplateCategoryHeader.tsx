import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { TemplateCategoryAddSheet } from './TemplateCategoryAddSheet';

export const TemplateCategoryHeader = () => {
  const favoriteBreadcrumb = createFavoriteBreadcrumb('Templates', 'Categories');

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

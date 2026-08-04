import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const TemplatesHeader = () => {
  const favoriteBreadcrumb = createFavoriteBreadcrumb('Templates');

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

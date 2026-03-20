import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';

export const TemplatesHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <TemplatesBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};

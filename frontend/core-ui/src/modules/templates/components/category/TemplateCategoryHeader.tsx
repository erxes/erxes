import { TemplatesBreadcrumb } from '@/templates/components/TemplatesBreadcrumb';
import { Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { TemplateCategoryAddSheet } from './TemplateCategoryAddSheet';

export const TemplateCategoryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <TemplatesBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <TemplateCategoryAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};

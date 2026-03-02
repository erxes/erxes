import { Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { TemplateImportSheet } from './TemplateImportSheet';
import { TemplatesBreadcrumb } from './TemplatesBreadcrumb';

export const TemplatesHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <TemplatesBreadcrumb />
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <TemplateImportSheet />
      </PageHeader.End>
    </PageHeader>
  );
};

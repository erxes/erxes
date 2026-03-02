import { TemplatesHeader } from '@/templates/components/TemplatesHeader';
import { TemplatesRecordTable } from '@/templates/components/TemplatesRecordTable';
import { PageContainer } from 'erxes-ui';

export const TemplateIndexPage = () => {
  return (
    <PageContainer>
      <TemplatesHeader />
      {/* <DocumentsFilter />
        <DocumentsLayout
            Documents={Documents}
            DocumentsTypes={DocumentsTypes}
            Editor={DocumentEditor}
        /> */}
      
      <TemplatesRecordTable />
    </PageContainer>
  );
};

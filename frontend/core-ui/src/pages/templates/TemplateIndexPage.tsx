import { TemplatesFilter } from '@/templates/components/TemplatesFilter';
import { TemplatesHeader } from '@/templates/components/TemplatesHeader';
import { TemplatesRecordTable } from '@/templates/components/TemplatesRecordTable';
import { PageContainer } from 'erxes-ui';

export const TemplateIndexPage = () => {
  return (
    <PageContainer>
      <TemplatesHeader />
      <TemplatesFilter />

      <TemplatesRecordTable />
    </PageContainer>
  );
};

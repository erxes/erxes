import { TemplateCategoryFilter } from '@/templates/components/category/TemplateCategoryFilter';
import { TemplateCategoryHeader } from '@/templates/components/category/TemplateCategoryHeader';
import { TemplateCategoryRecordTable } from '@/templates/components/category/TemplateCategoryRecordTable';
import { PageContainer } from 'erxes-ui';

export const TemplateCategoryIndexPage = () => {
  return (
    <PageContainer>
      <TemplateCategoryHeader />
      <TemplateCategoryFilter />

      <TemplateCategoryRecordTable />
    </PageContainer>
  );
};

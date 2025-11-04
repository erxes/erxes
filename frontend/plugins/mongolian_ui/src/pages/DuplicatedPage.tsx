import { PageContainer, PageSubHeader } from 'erxes-ui';
import { DuplicatedHeader } from '@/duplicated/components/DuplicatedHeader';
import { DuplicatedRecordTable } from '@/duplicated/components/DuplicatedRecordTable';
import { DuplicatedFilter } from '@/duplicated/components/DuplicatedFilter';

export const DuplicatedPage = () => {
  return (
    <PageContainer>
      <DuplicatedHeader />
      <PageSubHeader>
        <DuplicatedFilter />
      </PageSubHeader>
      <DuplicatedRecordTable />
    </PageContainer>
  );
};

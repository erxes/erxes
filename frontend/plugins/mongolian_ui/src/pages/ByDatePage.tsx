import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ByDateHeader } from '@/by-date/components/ByDateHeader';
import { ByDateRecordTable } from '@/by-date/components/ByDateRecordTable';
import { ByDateFilter } from '@/by-date/components/ByDateFilter';

export const ByDatePage = () => {
  return (
    <PageContainer>
      <ByDateHeader />
      <PageSubHeader>
        <ByDateFilter />
      </PageSubHeader>
      <ByDateRecordTable />
    </PageContainer>
  );
};

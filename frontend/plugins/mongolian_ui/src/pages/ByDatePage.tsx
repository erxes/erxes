import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ByDateHeader } from '@/put-responses-by-date/components/ByDateHeader';
import { ByDateRecordTable } from '@/put-responses-by-date/components/ByDateRecordTable';
import { ByDateFilter } from '@/put-responses-by-date/components/ByDateFilter';

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

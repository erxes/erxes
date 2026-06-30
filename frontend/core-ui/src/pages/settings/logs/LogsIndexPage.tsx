import { LogsBreadcrumb } from '@/logs/components/LogsBreadcrumb';
import { LogsRecordTable } from '@/logs/components/LogsRecordTable';
import { LogsRecordTableFilter } from '@/logs/components/filters/LogsRecordTableFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const LogsIndexPage = () => {
  return (
    <PageContainer>
      <LogsBreadcrumb />
      <PageSubHeader>
        <LogsRecordTableFilter />
      </PageSubHeader>
      <LogsRecordTable />
    </PageContainer>
  );
};

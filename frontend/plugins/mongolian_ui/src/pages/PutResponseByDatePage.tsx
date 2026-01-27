import { PageContainer, PageSubHeader } from 'erxes-ui';
import { ByDateHeader } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateHeader';
import { ByDateRecordTable } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateRecordTable';
import { ByDateFilter } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateFilter';

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

import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PutResponseFilter } from '~/modules/put-response/components/PutResponseFilter';
import { ByDateHeader } from '~/modules/by-date/components/ByDateHeader';
import { ByDateRecordTable } from '~/modules/by-date/components/ByDateRecordTable';

export const ByDatePage = () => {
  return (
    <PageContainer>
      <ByDateHeader />
      <PageSubHeader>
        <PutResponseFilter />
      </PageSubHeader>
      <ByDateRecordTable />
    </PageContainer>
  );
};

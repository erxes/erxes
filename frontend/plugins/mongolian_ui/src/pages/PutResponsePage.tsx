import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PutResponseFilter } from '~/modules/ebarimt/put-response/components/PutResponseFilter';
import { PutResponseHeader } from '~/modules/ebarimt/put-response/components/PutResponseHeader';
import { PutResponseRecordTable } from '~/modules/ebarimt/put-response/components/PutResponseRecordTable';

export const PutResponseIndexPage = () => {
  return (
    <PageContainer>
      <PutResponseHeader />
      <PageSubHeader>
        <PutResponseFilter />
      </PageSubHeader>
      <PutResponseRecordTable />
    </PageContainer>
  );
};

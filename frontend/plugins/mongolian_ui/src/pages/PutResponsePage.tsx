import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PutResponseFilter } from '@/put-response/components/PutResponseFilter';
import { PutResponseHeader } from '@/put-response/components/PutResponseHeader';
import { PutResponseRecordTable } from '@/put-response/components/PutResponseRecordTable';

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

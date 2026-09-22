import { PageSubHeader } from 'erxes-ui';
import { PutResponseFilter } from '~/modules/ebarimt/put-response/components/PutResponseFilter';
import { PutResponseRecordTable } from '~/modules/ebarimt/put-response/components/PutResponseRecordTable';

export const PutResponseIndexPage = () => {
  return (
    <>
      <PageSubHeader>
        <PutResponseFilter />
      </PageSubHeader>
      <PutResponseRecordTable />
    </>
  );
};

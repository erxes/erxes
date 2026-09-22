import { PageSubHeader } from 'erxes-ui';
import { DuplicatedRecordTable } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedRecordTable';
import { DuplicatedFilter } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedFilter';

export const DuplicatedPage = () => {
  return (
    <>
      <PageSubHeader>
        <DuplicatedFilter />
      </PageSubHeader>
      <DuplicatedRecordTable />
    </>
  );
};

import { PageSubHeader } from 'erxes-ui';
import { ByDateRecordTable } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateRecordTable';
import { ByDateFilter } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateFilter';

export const ByDatePage = () => {
  return (
    <>
      <PageSubHeader>
        <ByDateFilter />
      </PageSubHeader>
      <ByDateRecordTable />
    </>
  );
};

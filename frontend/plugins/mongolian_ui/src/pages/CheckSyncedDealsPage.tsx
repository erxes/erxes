import { PageSubHeader } from 'erxes-ui';
import { CheckSyncedDealsFilter } from '~/modules/erkhet-sync/check-synced-deals/components/CheckSyncedDealsFilter';
import { CheckSyncedDealsRecordTable } from '@/erkhet-sync/check-synced-deals/components/CheckSyncedDealsRecordTable';

export const CheckSyncedDealsPage = () => {
  return (
    <>
      <PageSubHeader>
        <CheckSyncedDealsFilter />
      </PageSubHeader>
      <CheckSyncedDealsRecordTable />
    </>
  );
};

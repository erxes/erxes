import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CheckSyncedDealsHeader } from '@/erkhet-sync/check-synced-deals/components/CheckSyncedDealsHeader';
import { CheckSyncedDealsFilter } from '~/modules/erkhet-sync/check-synced-deals/components/CheckSyncedDealsFilter';
import { CheckSyncedDealsRecordTable } from '@/erkhet-sync/check-synced-deals/components/CheckSyncedDealsRecordTable';

export const CheckSyncedDealsPage = () => {
  return (
    <PageContainer>
      <CheckSyncedDealsHeader />
      <PageSubHeader>
        <CheckSyncedDealsFilter />
      </PageSubHeader>
      <CheckSyncedDealsRecordTable />
    </PageContainer>
  );
};

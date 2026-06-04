import { PageContainer, PageSubHeader } from 'erxes-ui';
import { AccountingCheckSyncedDealsFilter } from './AccountingCheckSyncedDealsFilter';
import { AccountingCheckSyncedDealsRecordTable } from './AccountingCheckSyncedDealsRecordTable';

export const AccountingCheckSyncedDealsPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountingCheckSyncedDealsFilter />
      </PageSubHeader>
      <AccountingCheckSyncedDealsRecordTable />
    </PageContainer>
  );
};

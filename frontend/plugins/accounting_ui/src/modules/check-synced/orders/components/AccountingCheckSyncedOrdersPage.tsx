import { PageContainer, PageSubHeader } from 'erxes-ui';
import { AccountingCheckSyncedOrdersFilter } from './AccountingCheckSyncedOrdersFilter';
import { AccountingCheckSyncedOrdersRecordTable } from './AccountingCheckSyncedOrdersRecordTable';

export const AccountingCheckSyncedOrdersPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountingCheckSyncedOrdersFilter />
      </PageSubHeader>
      <AccountingCheckSyncedOrdersRecordTable />
    </PageContainer>
  );
};

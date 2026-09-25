import { PageSubHeader } from 'erxes-ui';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { FxaOwnerRecordActions } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordActions';
import { FxaOwnerRecordFilters } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordFilters';
import { FxaOwnerRecordsTable } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordsTable';

export const FxaOwnerRecordsPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/fixed-assets/owner-records"
        returnText="Эд хариуцагч"
        skipSettings={true}
      >
        <FxaOwnerRecordActions />
      </AccountingHeader>
      <PageSubHeader>
        <FxaOwnerRecordFilters />
      </PageSubHeader>
      <FxaOwnerRecordsTable />
    </AccountingLayout>
  );
};

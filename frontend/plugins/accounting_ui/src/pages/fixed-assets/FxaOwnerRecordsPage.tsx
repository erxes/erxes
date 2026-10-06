import { useTranslation } from 'react-i18next';
import { PageSubHeader } from 'erxes-ui';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { FxaOwnerRecordActions } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordActions';
import { FxaOwnerRecordFilters } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordFilters';
import { FxaOwnerRecordsTable } from '~/modules/fixedAssets/ownerRecords/components/FxaOwnerRecordsTable';

export const FxaOwnerRecordsPage = () => {
  const { t } = useTranslation('accounting');

  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/fixed-assets/owner-records"
        returnText={t('asset-custodian')}
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

import { useTranslation } from 'react-i18next';
import { useAdjustFundRates } from '../hooks/useAdjustFundRates';
import { adjustFundRateColumns } from './AdjustFundRateTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AdjustFundRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFundRates, loading, error } = useAdjustFundRates();

  if (!loading && !adjustFundRates?.length) {
    return <AccountingEmptyState error={error} icon={IconAdjustmentsOff} />;
  }

  return (
    <RecordTable.Provider
      columns={adjustFundRateColumns(t)}
      data={adjustFundRates || []}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={5} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

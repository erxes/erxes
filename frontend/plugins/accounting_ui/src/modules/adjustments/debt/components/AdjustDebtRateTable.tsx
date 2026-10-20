import { useTranslation } from 'react-i18next';
import { useAdjustDebtRates } from '../hooks/useAdjustDebtRates';
import { adjustDebtRateColumns } from './AdjustDebtRateTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AdjustDebtRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustDebtRates, loading, error } = useAdjustDebtRates();

  if (!loading && !adjustDebtRates?.length) {
    return <AccountingEmptyState error={error} icon={IconAdjustmentsOff} />;
  }

  return (
    <RecordTable.Provider
      columns={adjustDebtRateColumns(t)}
      data={adjustDebtRates || []}
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

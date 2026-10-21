import { useTranslation } from 'react-i18next';
import { useAdjustDebtRates } from '@/adjustments/debt/hooks/useAdjustDebtRates';
import { adjustDebtRateColumns } from '@/adjustments/debt/components/AdjustDebtRateTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAdjustDebtRate } from '@/adjustments/debt/components/AdjustDebtRateForm';

export const AdjustDebtRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustDebtRates, loading, error } = useAdjustDebtRates();

  const isEmpty = !loading && !adjustDebtRates?.length;

  return (
    <RecordTable.Provider
      columns={adjustDebtRateColumns(t)}
      data={adjustDebtRates || []}
      stickyColumns={[]}
      className="relative m-3"
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
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconAdjustmentsOff}
          description={t('empty-list-description')}
          action={<AddAdjustDebtRate />}
        />
      )}
    </RecordTable.Provider>
  );
};

import { useTranslation } from 'react-i18next';
import { useAdjustFundRates } from '@/adjustments/rate/hooks/useAdjustFundRates';
import { adjustFundRateColumns } from '@/adjustments/rate/components/AdjustFundRateTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAdjustFundRate } from '@/adjustments/rate/components/AdjustFundRateForm';

export const AdjustFundRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFundRates, loading, error } = useAdjustFundRates();

  const isEmpty = !loading && !adjustFundRates?.length;

  return (
    <RecordTable.Provider
      columns={adjustFundRateColumns(t)}
      data={adjustFundRates || []}
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
          action={<AddAdjustFundRate />}
        />
      )}
    </RecordTable.Provider>
  );
};

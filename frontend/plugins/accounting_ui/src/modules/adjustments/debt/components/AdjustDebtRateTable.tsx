import { useTranslation } from 'react-i18next';
import { useAdjustDebtRates } from '@/adjustments/debt/hooks/useAdjustDebtRates';
import { adjustDebtRateColumns } from '@/adjustments/debt/components/AdjustDebtRateTableColumns';
import { AddAdjustDebtRate } from '@/adjustments/debt/components/AdjustDebtRateForm';
import { AdjustRateTable } from '@/adjustments/components/AdjustRateTable';

export const AdjustDebtRateTable = () => {
  const { t } = useTranslation('accounting');
  const {
    adjustDebtRates,
    loading,
    error,
    pageInfo,
    handleFetchMore,
    retryFetchMore,
    fetchMoreError,
  } = useAdjustDebtRates();

  return (
    <AdjustRateTable
      columns={adjustDebtRateColumns(t)}
      rows={adjustDebtRates}
      loading={loading}
      error={error}
      hasNextPage={pageInfo?.hasNextPage}
      onFetchMore={handleFetchMore}
      fetchMoreError={fetchMoreError}
      onRetryFetchMore={retryFetchMore}
      addAction={<AddAdjustDebtRate />}
    />
  );
};

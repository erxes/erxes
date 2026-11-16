import { useTranslation } from 'react-i18next';
import { useAdjustFundRates } from '@/adjustments/rate/hooks/useAdjustFundRates';
import { adjustFundRateColumns } from '@/adjustments/rate/components/AdjustFundRateTableColumns';
import { AddAdjustFundRate } from '@/adjustments/rate/components/AdjustFundRateForm';
import { AdjustRateTable } from '@/adjustments/components/AdjustRateTable';

export const AdjustFundRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFundRates, loading, error, pageInfo, handleFetchMore } =
    useAdjustFundRates();

  return (
    <AdjustRateTable
      columns={adjustFundRateColumns(t)}
      rows={adjustFundRates}
      loading={loading}
      error={error}
      hasNextPage={pageInfo?.hasNextPage}
      onFetchMore={handleFetchMore}
      addAction={<AddAdjustFundRate />}
    />
  );
};

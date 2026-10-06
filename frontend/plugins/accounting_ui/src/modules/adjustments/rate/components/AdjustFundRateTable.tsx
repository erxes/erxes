import { useTranslation } from 'react-i18next';
import { useAdjustFundRates } from '../hooks/useAdjustFundRates';
import { adjustFundRateColumns } from './AdjustFundRateTableColumns';
import { RecordTable } from 'erxes-ui';

export const AdjustFundRateTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFundRates, loading } = useAdjustFundRates();

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

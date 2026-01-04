import { useAdjustFundRates } from '../hooks/useAdjustFundRates';
import { adjustFundRateColumns } from './AdjustFundRateTableColumns';
import { RecordTable } from 'erxes-ui';

export const AdjustFundRateTable = () => {
  const { adjustFundRates, loading, totalCount } = useAdjustFundRates();

  return (
    <RecordTable.Provider
      columns={adjustFundRateColumns}
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

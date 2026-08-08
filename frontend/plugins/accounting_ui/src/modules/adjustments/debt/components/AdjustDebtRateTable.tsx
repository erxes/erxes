import { useAdjustDebtRates } from '../hooks/useAdjustDebtRates';
import { adjustDebtRateColumns } from './AdjustDebtRateTableColumns';
import { RecordTable } from 'erxes-ui';

export const AdjustDebtRateTable = () => {
  const { adjustDebtRates, loading, totalCount } = useAdjustDebtRates();

  return (
    <RecordTable.Provider
      columns={adjustDebtRateColumns}
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

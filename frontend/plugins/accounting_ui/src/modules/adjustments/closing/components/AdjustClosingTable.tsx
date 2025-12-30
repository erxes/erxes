import { RecordTable } from 'erxes-ui';
import { useAdjustClosing } from '../hooks/useAdjustClosing';
import { adjustClosingTableColumns } from './AdjustClosingColumns';

export const AdjustClosingTable = () => {
  const { adjustClosing, loading, totalCount, handleFetchMore } =
    useAdjustClosing();

  return (
    <RecordTable.Provider
      columns={adjustClosingTableColumns}
      data={adjustClosing || []}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustClosing?.length && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

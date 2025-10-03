import { useAdjustInventories } from '../hooks/useAdjustInventories';
import { adjustTableColumns } from './AdjustTableColumns';
import { RecordTable } from 'erxes-ui';

export const AdjustTable = () => {
  const { adjustInventories, loading, totalCount, handleFetchMore } =
    useAdjustInventories();

  return (
    <RecordTable.Provider
      columns={adjustTableColumns}
      data={adjustInventories || []}
      stickyColumns={[]}
      className='m-3'
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustInventories?.length && (
              <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

import { RecordTable } from 'erxes-ui';
import { useAdjustFixedAssets } from '../hooks/useAdjustFixedAssets';
import { adjustFixedAssetTableColumns } from './AdjustFixedAssetTableColumns';

export const AdjustFixedAssetTable = () => {
  const { adjustFixedAssets, loading, totalCount, handleFetchMore } =
    useAdjustFixedAssets();

  return (
    <RecordTable.Provider
      columns={adjustFixedAssetTableColumns}
      data={adjustFixedAssets}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustFixedAssets.length && (
              <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

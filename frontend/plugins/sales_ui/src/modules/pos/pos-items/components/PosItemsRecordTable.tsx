import { RecordTable, Spinner } from 'erxes-ui';
import { PosItemColumns } from './PosItemColumns';
import { usePosItemsList } from '@/pos/pos-items/hooks/UsePosItemsList';
import { IconShoppingCartX } from '@tabler/icons-react';

export const PosItemsRecordTable = ({ posId }: { posId?: string }) => {
  const { posItemList, handleFetchMore, loading, pageInfo } = usePosItemsList({
    posId,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  if (loading) return <Spinner />;
  return (
    <RecordTable.Provider
      columns={PosItemColumns}
      data={posItemList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={posItemList?.length}
        sessionKey="posItem_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && posItemList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No pos items yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first pos item.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

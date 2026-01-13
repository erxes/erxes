import { RecordTable } from 'erxes-ui';
import { usePosByItemsList } from '@/pos/pos-by-items/hooks/UsePosByItemsList';
import { PosByItemsColumns } from '@/pos/pos-by-items/components/PosByItemsColumn';
import { IconShoppingCartX } from '@tabler/icons-react';

export const PosByItemsRecordTable = ({ posId }: { posId?: string }) => {
  const { posByItemsList, handleFetchMore, loading, pageInfo } =
    usePosByItemsList({ posId });

  return (
    <RecordTable.Provider
      columns={PosByItemsColumns}
      data={posByItemsList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posByItemsList?.length}
        sessionKey="posByItems_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && posByItemsList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No pos by items yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first pos by items.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

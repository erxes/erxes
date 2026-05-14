import { RecordTable } from 'erxes-ui';
import { PosOrdersBySubsColumns } from '@/pos/pos-order-by-subsription/components/PosOrdersBySubsColumns';
import { usePosOrderBySubscriptionList } from '@/pos/pos-order-by-subsription/hooks/usePosOrderBySubsriptionList';
import { IconShoppingCartX } from '@tabler/icons-react';

export const PosOrdersBySubsRecordTable = ({ posId }: { posId?: string }) => {
  const { posOrderBySubscriptionList, handleFetchMore, loading, pageInfo } =
    usePosOrderBySubscriptionList({ posId });

  return (
    <RecordTable.Provider
      columns={PosOrdersBySubsColumns}
      data={posOrderBySubscriptionList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'group']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posOrderBySubscriptionList?.length}
        sessionKey="posOrdersBySubs_cursor"
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
        {!loading && posOrderBySubscriptionList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No pos order by subscription yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first pos order by subscription.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

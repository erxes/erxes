import { RecordTable } from 'erxes-ui';
import { orderColumns } from '@/pos/orders/components/OrderColumns';
import { useOrdersList } from '@/pos/orders/hooks/UseOrderList';
import { OrderCommandBar } from '@/pos/orders/components/order-command-bar/OrderCommandBar';
import { IconShoppingCartX } from '@tabler/icons-react';

export const OrderRecordTable = ({ posId }: { posId?: string }) => {
  const { ordersList, handleFetchMore, loading, pageInfo } = useOrdersList({
    posId,
  });

  return (
    <RecordTable.Provider
      columns={orderColumns}
      data={ordersList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={ordersList?.length}
        sessionKey="orders_cursor"
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
        {!loading && ordersList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first order.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <OrderCommandBar />
    </RecordTable.Provider>
  );
};

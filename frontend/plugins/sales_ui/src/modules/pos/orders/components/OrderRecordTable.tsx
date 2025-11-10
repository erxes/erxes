import { RecordTable } from 'erxes-ui';

import { orderColumns } from '@/pos/orders/components/OrderColumns';
import { useOrdersList } from '@/pos/orders/hooks/UseOrderList';
import { OrderCommandBar } from '@/pos/orders/components/order-command-bar/OrderCommandBar';

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
      </RecordTable.CursorProvider>
      <OrderCommandBar />
    </RecordTable.Provider>
  );
};

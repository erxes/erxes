import { RecordTable } from 'erxes-ui';


import { orderColumns } from './OrderColumns';
import { useOrdersList } from '../hooks/UseOrderList';
import { OrderCommandBar } from './order-command-bar/OrderCommandBar';


export const OrderRecordTable = () => {
  const { ordersList, handleFetchMore, loading, pageInfo } = useOrdersList();

  return (
    <RecordTable.Provider
      columns={orderColumns}
      data={ordersList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
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

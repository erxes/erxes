import { RecordTable } from 'erxes-ui';
import { PosItemsCommandBar } from './pos-items-command-bar/PosItemsCommandBar';
import { orderColumns } from './PosItemColumns';
import { useOrdersList } from '../../orders/hooks/UseOrderList';

export const PosItemsRecordTable = () => {
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
      <PosItemsCommandBar />
    </RecordTable.Provider>
  );
};

import { RecordTable } from 'erxes-ui';
import { PosOrdersByCustomerCommandBar } from '@/pos/pos-orders-by-customer/components/pos-orders-by-customer-command-bar/PosOrdersByCustomerCommandBar';
import { PosOrdersByCustomerColumns } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerColumns';
import { usePosOrderByCustomerList } from '@/pos/pos-orders-by-customer/hooks/UsePosOrderByCustomer';

export const PosOrdersByCustomerRecordTable = ({
  posId,
}: {
  posId?: string;
}) => {
  const { posOrderByCustomerList, handleFetchMore, loading, pageInfo } =
    usePosOrderByCustomerList({ posId });

  return (
    <RecordTable.Provider
      columns={PosOrdersByCustomerColumns}
      data={posOrderByCustomerList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posOrderByCustomerList?.length}
        sessionKey="pos_orders_by_customer_cursor"
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
      <PosOrdersByCustomerCommandBar />
    </RecordTable.Provider>
  );
};

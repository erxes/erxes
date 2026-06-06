import { RecordTable } from 'erxes-ui';
import { PosOrdersByCustomerColumns } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerColumns';
import { usePosOrderByCustomerList } from '@/pos/pos-orders-by-customer/hooks/UsePosOrderByCustomer';
import { IconShoppingCartX } from '@tabler/icons-react';
export const PosOrdersByCustomerRecordTable = () => {
  const { posOrderByCustomerList, handleFetchMore, loading, pageInfo } =
    usePosOrderByCustomerList();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={PosOrdersByCustomerColumns}
      data={posOrderByCustomerList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'type']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={posOrderByCustomerList?.length}
        sessionKey="pos_orders_by_customer_cursor"
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
        {!loading && posOrderByCustomerList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No pos order by customer yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first pos order by customer.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { checkPosOrdersColumns } from './CheckPosOrdersColumn';

import { CHECK_POS_ORDERS_CURSOR_SESSION_KEY } from '../constants/checkPosOrdersCursorSessionKey';
import { useCheckPosOrders } from '../hooks/useCheckPosOrders';
import { ICheckPosOrders } from '../types/checkPosOrders';

const CheckOrdersButton = ({
  checking,
  onCheck,
  orders,
}: {
  checking: boolean;
  onCheck: (ids: string[]) => void;
  orders: ICheckPosOrders[];
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getSelectedRowModel().rows;
  const ids = (
    selectedRows.length
      ? selectedRows.map((row) => row.original._id)
      : orders.map((order) => order._id)
  ).filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {selectedRows.length
          ? `${selectedRows.length} selected`
          : `${orders.length} orders`}
      </div>
      <Button onClick={() => onCheck(ids)} disabled={checking || !ids.length}>
        {checking ? 'Checking...' : 'Check Orders'}
      </Button>
    </div>
  );
};

export const CheckPosOrdersRecordTable = () => {
  const {
    checkOrders,
    checkPosOrders,
    checking,
    handleFetchMore,
    loading,
    pageInfo,
  } = useCheckPosOrders();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={checkPosOrdersColumns || []}
      data={checkPosOrders || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <CheckOrdersButton
        checking={checking}
        onCheck={checkOrders}
        orders={checkPosOrders || []}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={checkPosOrders?.length}
        sessionKey={CHECK_POS_ORDERS_CURSOR_SESSION_KEY}
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
        {!loading && checkPosOrders?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

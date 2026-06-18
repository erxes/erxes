import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo } from 'react';
import {
  getCheckPosOrdersColumns,
  isSyncableOrder,
} from './CheckPosOrdersColumn';

import { CHECK_POS_ORDERS_CURSOR_SESSION_KEY } from '../constants/checkPosOrdersCursorSessionKey';
import { useCheckPosOrders } from '../hooks/useCheckPosOrders';
import { ICheckPosOrders } from '../types/checkPosOrders';

const CheckOrdersButton = ({
  checking,
  syncing,
  toSyncCount,
  onCheck,
  onSyncUnchecked,
  orders,
}: {
  checking: boolean;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSyncUnchecked: () => void;
  orders: ICheckPosOrders[];
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getSelectedRowModel().rows;
  const ids = selectedRows.map((row) => row.original._id).filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {selectedRows.length} selected / {orders.length} orders
      </div>
      <Button onClick={() => onCheck(ids)} disabled={checking || !ids.length}>
        {checking ? 'Checking...' : 'Check Orders'}
      </Button>
      <Button
        onClick={onSyncUnchecked}
        disabled={syncing || !toSyncCount}
        variant="outline"
      >
        {syncing ? 'Syncing...' : `Sync Selected (${toSyncCount})`}
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
    setAllOrdersToSync,
    setOrderToSync,
    syncUncheckedOrders,
    syncSelectedOrderIds,
    syncing,
    toSyncOrderIds,
  } = useCheckPosOrders();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const syncableOrderIds = useMemo(
    () =>
      (checkPosOrders || []).filter(isSyncableOrder).map((order) => order._id),
    [checkPosOrders],
  );
  const columns = useMemo(
    () =>
      getCheckPosOrdersColumns({
        toSyncOrderIds,
        syncableOrderIds,
        onToggleToSync: setOrderToSync,
        onToggleAllToSync: setAllOrdersToSync,
      }),
    [setAllOrdersToSync, setOrderToSync, syncableOrderIds, toSyncOrderIds],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={checkPosOrders || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'toSync', 'createdAt']}
    >
      <CheckOrdersButton
        checking={checking}
        onCheck={checkOrders}
        onSyncUnchecked={() => syncUncheckedOrders(syncSelectedOrderIds)}
        orders={checkPosOrders || []}
        syncing={syncing}
        toSyncCount={syncSelectedOrderIds.length}
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

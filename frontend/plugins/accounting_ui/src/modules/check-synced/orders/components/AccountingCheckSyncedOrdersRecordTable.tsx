import { RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAccountingCheckSyncedOrdersColumns,
  isSyncableAccountingOrder,
} from './AccountingCheckSyncedOrdersColumns';
import {
  ACCOUNTING_CHECK_SYNCED_ORDERS_SESSION_KEY,
  useAccountingCheckSyncedOrders,
} from '../hooks/useAccountingCheckSyncedOrders';
import { AccountingCheckSyncedOrdersCommandBar } from './AccountingCheckSyncedOrdersCommandBar';

/** ene order baihgui ued garna. */
const NoOrdersEmptyState = () => {
  const { t } = useTranslation('accounting');
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <IconShoppingCartX size={48} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {t('no-orders')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('select-rule-or-adjust-filters-orders')}
        </p>
      </div>
    </div>
  );
};

/** ene order table-iig zurj bga. */
export const AccountingCheckSyncedOrdersRecordTable = () => {
  const {
    canSync,
    checkOrders,
    checking,
    handleFetchMore,
    loading,
    orders,
    pageInfo,
    setAllOrdersToSync,
    setOrderToSync,
    syncOrders,
    syncSelectedOrderIds,
    syncing,
    toSyncOrderIds,
  } = useAccountingCheckSyncedOrders();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const syncableOrderIds = useMemo(
    () =>
      (orders || [])
        .filter(isSyncableAccountingOrder)
        .map((order) => order._id),
    [orders],
  );
  const columns = useMemo(
    () =>
      getAccountingCheckSyncedOrdersColumns({
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
      data={orders || []}
      className="m-3"
      stickyColumns={['checkbox', 'toSync', 'number']}
    >
      <AccountingCheckSyncedOrdersCommandBar
        canSync={canSync}
        checking={checking}
        syncing={syncing}
        toSyncCount={syncSelectedOrderIds.length}
        onCheck={checkOrders}
        onSync={() => syncOrders(syncSelectedOrderIds)}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={orders?.length}
        sessionKey={ACCOUNTING_CHECK_SYNCED_ORDERS_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={50} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && orders?.length === 0 && <NoOrdersEmptyState />}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

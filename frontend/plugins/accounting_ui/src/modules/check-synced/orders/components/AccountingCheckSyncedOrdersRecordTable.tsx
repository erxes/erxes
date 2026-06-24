import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAccountingCheckSyncedOrdersColumns,
  isSyncableAccountingOrder,
} from './AccountingCheckSyncedOrdersColumns';
import { AccountingCheckSyncedOrderRulePicker } from './AccountingCheckSyncedOrderRuleSelect';
import {
  ACCOUNTING_CHECK_SYNCED_ORDERS_SESSION_KEY,
  useAccountingCheckSyncedOrders,
} from '../hooks/useAccountingCheckSyncedOrders';

const NoOrdersEmptyState = () => {
  const { t } = useTranslation('accounting');
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6">
          <IconShoppingCartX size={48} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{t('no-orders')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('select-rule-or-adjust-filters-orders')}
        </p>
      </div>
    </div>
  );
};

const AccountingCheckSyncedOrdersActions = ({
  checking,
  canSync,
  ordersCount,
  syncing,
  toSyncCount,
  onCheck,
  onSync,
}: {
  checking: boolean;
  canSync: boolean;
  ordersCount: number;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSync: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original._id)
    .filter(Boolean);

  const getSyncButtonLabel = () => {
    if (syncing) return t('syncing');
    if (!canSync) return t('select-rule-to-sync');
    return t('sync-selected', { count: toSyncCount });
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} {t('selected')} / {ordersCount} {t('orders')}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onCheck(selectedIds)}
          disabled={checking || !selectedIds.length}
        >
          {checking ? t('checking') : t('check-orders')}
        </Button>
        {canSync ? (
          <Button
            onClick={onSync}
            disabled={syncing || !toSyncCount}
            variant="outline"
          >
            {getSyncButtonLabel()}
          </Button>
        ) : (
          <AccountingCheckSyncedOrderRulePicker>
            <Button variant="outline" disabled={syncing}>
              {getSyncButtonLabel()}
            </Button>
          </AccountingCheckSyncedOrderRulePicker>
        )}
      </div>
    </div>
  );
};

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
      <AccountingCheckSyncedOrdersActions
        canSync={canSync}
        checking={checking}
        ordersCount={orders?.length || 0}
        syncing={syncing}
        onCheck={checkOrders}
        onSync={() => syncOrders(syncSelectedOrderIds)}
        toSyncCount={syncSelectedOrderIds.length}
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
            {loading && <RecordTable.RowSkeleton rows={50} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && orders?.length === 0 && (
          <NoOrdersEmptyState />
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

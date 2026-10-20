import {
  ACCOUNTING_CHECK_SYNCED_ORDERS_SESSION_KEY,
  useAccountingCheckSyncedOrders,
} from '../hooks/useAccountingCheckSyncedOrders';

import { AccountingCheckSyncedOrdersCommandBar } from './AccountingCheckSyncedOrdersCommandBar';
import { IconShoppingCartX } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { getAccountingCheckSyncedOrdersColumns } from './AccountingCheckSyncedOrdersColumns';
import { isSyncable } from '~/modules/check-synced/constants/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const AccountingCheckSyncedOrdersRecordTable = () => {
  const { t } = useTranslation('accounting');
  const {
    canSync,
    checkOrders,
    checking,
    handleFetchMore,
    loading,
    error,
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
    () => (orders || []).filter(isSyncable).map((order) => order._id),
    [orders],
  );
  const columns = useMemo(
    () =>
      getAccountingCheckSyncedOrdersColumns({
        t,
        toSyncOrderIds,
        syncableOrderIds,
        onToggleToSync: setOrderToSync,
        onToggleAllToSync: setAllOrdersToSync,
      }),
    [setAllOrdersToSync, setOrderToSync, syncableOrderIds, toSyncOrderIds, t],
  );

  if (!loading && !orders?.length) {
    return (
      <AccountingEmptyState
        error={error}
        icon={IconShoppingCartX}
        title={t('no-orders')}
        description={t('select-rule-or-adjust-filters-orders')}
      />
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={orders || []}
      className="m-3"
      stickyColumns={['checkbox', 'toSync', 'number']}
      tableId="accounting_check_synced_orders_record_table"
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
          <RecordTable.Header showColumnSelector />
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
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo } from 'react';
import {
  getAccountingCheckSyncedDealsColumns,
  isSyncableAccountingDeal,
} from './AccountingCheckSyncedDealsColumns';
import {
  ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY,
  useAccountingCheckSyncedDeals,
} from '../hooks/useAccountingCheckSyncedDeals';

const getSyncButtonLabel = ({
  canSync,
  syncing,
  toSyncCount,
}: {
  canSync: boolean;
  syncing: boolean;
  toSyncCount: number;
}) => {
  if (syncing) {
    return 'Syncing...';
  }

  if (!canSync) {
    return 'Select rule to sync';
  }

  return `Sync Selected (${toSyncCount})`;
};

const AccountingCheckSyncedDealsActions = ({
  checking,
  canSync,
  dealsCount,
  syncing,
  toSyncCount,
  onCheck,
  onSync,
}: {
  checking: boolean;
  canSync: boolean;
  dealsCount: number;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSync: () => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original._id)
    .filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {selectedIds.length} selected / {dealsCount} deals
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onCheck(selectedIds)}
          disabled={checking || !selectedIds.length}
        >
          {checking ? 'Checking...' : 'Check Deals'}
        </Button>
        <Button
          onClick={onSync}
          disabled={syncing || !toSyncCount || !canSync}
          variant="outline"
        >
          {getSyncButtonLabel({ canSync, syncing, toSyncCount })}
        </Button>
      </div>
    </div>
  );
};

export const AccountingCheckSyncedDealsRecordTable = () => {
  const {
    canSync,
    checking,
    checkDeals,
    deals,
    handleFetchMore,
    loading,
    pageInfo,
    setAllDealsToSync,
    setDealToSync,
    syncDeals,
    syncSelectedDealIds,
    syncing,
    toSyncDealIds,
  } = useAccountingCheckSyncedDeals();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const syncableDealIds = useMemo(
    () =>
      (deals || []).filter(isSyncableAccountingDeal).map((deal) => deal._id),
    [deals],
  );
  const columns = useMemo(
    () =>
      getAccountingCheckSyncedDealsColumns({
        toSyncDealIds,
        syncableDealIds,
        onToggleToSync: setDealToSync,
        onToggleAllToSync: setAllDealsToSync,
      }),
    [setAllDealsToSync, setDealToSync, syncableDealIds, toSyncDealIds],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={deals || []}
      className="m-3"
      stickyColumns={['checkbox', 'toSync', 'name']}
    >
      <AccountingCheckSyncedDealsActions
        canSync={canSync}
        checking={checking}
        dealsCount={deals?.length || 0}
        syncing={syncing}
        onCheck={checkDeals}
        onSync={() => syncDeals(syncSelectedDealIds)}
        toSyncCount={syncSelectedDealIds.length}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={deals?.length}
        sessionKey={ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY}
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
        {!loading && deals?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No deals</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a rule or adjust filters to find deals.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

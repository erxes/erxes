import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCheckSyncedDealsColumns,
  isSyncableDeal,
} from './CheckSyncedDealsColumn';

import { CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY } from '../constants/checkSyncedDealsCursorSessionKey';
import { useCheckSyncedDeals } from '../hooks/useCheckSyncedDeals';
import { ICheckSyncedDeals } from '../types/checkSyncedDeals';

const CheckDealsButton = ({
  deals,
  checking,
  syncing,
  toSyncCount,
  onCheck,
  onSyncUnchecked,
}: {
  deals: ICheckSyncedDeals[];
  checking: boolean;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSyncUnchecked: () => void;
}) => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getSelectedRowModel().rows;
  const ids = selectedRows.map((row) => row.original._id).filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {t('selected-of-deals', { selected: selectedRows.length, total: deals.length })}
      </div>
      <Button onClick={() => onCheck(ids)} disabled={checking || !ids.length}>
        {checking ? t('checking') : t('check-deals')}
      </Button>
      <Button
        onClick={onSyncUnchecked}
        disabled={syncing || !toSyncCount}
        variant="outline"
      >
        {syncing ? t('syncing') : t('sync-selected', { count: toSyncCount })}
      </Button>
    </div>
  );
};

export const CheckSyncedDealsRecordTable = () => {
  const { t } = useTranslation('mongolian');
  const {
    Deals,
    checkDeals,
    checking,
    handleFetchMore,
    loading,
    pageInfo,
    setAllDealsToSync,
    setDealToSync,
    syncUncheckedDeals,
    syncSelectedDealIds,
    syncing,
    toSyncDealIds,
  } = useCheckSyncedDeals();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const syncableDealIds = useMemo(
    () => (Deals || []).filter(isSyncableDeal).map((deal) => deal._id),
    [Deals],
  );
  const columns = useMemo(
    () =>
      getCheckSyncedDealsColumns({
        toSyncDealIds,
        syncableDealIds,
        onToggleToSync: setDealToSync,
        onToggleAllToSync: setAllDealsToSync,
        t,
      }),
    [setAllDealsToSync, setDealToSync, syncableDealIds, toSyncDealIds, t],
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={Deals || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'toSync', 'createdAt']}
    >
      <CheckDealsButton
        deals={Deals || []}
        checking={checking}
        onCheck={checkDeals}
        onSyncUnchecked={() => syncUncheckedDeals(syncSelectedDealIds)}
        syncing={syncing}
        toSyncCount={syncSelectedDealIds.length}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={Deals?.length}
        sessionKey={CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY}
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
        {!loading && Deals?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('no-sync-yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('create-first-sync')}
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

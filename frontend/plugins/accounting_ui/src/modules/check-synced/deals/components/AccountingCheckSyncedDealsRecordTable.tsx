import {
  ACCOUNTING_CHECK_SYNCED_DEAL_MOVEMENTS_SESSION_KEY,
  ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY,
  useAccountingCheckSyncedDeals,
} from '@/check-synced/deals/hooks/useAccountingCheckSyncedDeals';

import { AccountingCheckSyncedDealsCommandBar } from '@/check-synced/deals/components/AccountingCheckSyncedDealsCommandBar';
import { IconShoppingCartX } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { getAccountingCheckSyncedDealsColumns } from '@/check-synced/deals/components/AccountingCheckSyncedDealsColumns';
import { isSyncable } from '~/modules/check-synced/constants/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountingCheckSyncedDealRuleScope } from '@/check-synced/deals/components/AccountingCheckSyncedDealRuleSelect';

export const AccountingCheckSyncedDealsRecordTable = ({
  ruleScope = 'deal',
  sessionKey = ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY,
  tableId = 'accounting_check_synced_deals_record_table',
}: {
  ruleScope?: AccountingCheckSyncedDealRuleScope;
  sessionKey?: string;
  tableId?: string;
}) => {
  const { t } = useTranslation('accounting');
  const {
    canSync,
    checking,
    checkDeals,
    deals,
    handleFetchMore,
    loading,
    error,
    pageInfo,
    setAllDealsToSync,
    setDealToSync,
    syncDeals,
    syncSelectedDealIds,
    syncing,
    toSyncDealIds,
  } = useAccountingCheckSyncedDeals({ sessionKey });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const syncableDealIds = useMemo(
    () => (deals || []).filter(isSyncable).map((deal) => deal._id),
    [deals],
  );
  const columns = useMemo(
    () =>
      getAccountingCheckSyncedDealsColumns({
        t,
        toSyncDealIds,
        syncableDealIds,
        onToggleToSync: setDealToSync,
        onToggleAllToSync: setAllDealsToSync,
      }),
    [setAllDealsToSync, setDealToSync, syncableDealIds, toSyncDealIds, t],
  );

  const isEmpty = !loading && !deals?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={deals || []}
      className="relative m-3"
      stickyColumns={['checkbox', 'toSync', 'name']}
      tableId={tableId}
    >
      <AccountingCheckSyncedDealsCommandBar
        canSync={canSync}
        checking={checking}
        syncing={syncing}
        toSyncCount={syncSelectedDealIds.length}
        onCheck={checkDeals}
        onSync={() => syncDeals(syncSelectedDealIds)}
        ruleScope={ruleScope}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={deals?.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header showColumnSelector />
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
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconShoppingCartX}
          title={t('no-deals')}
          description={t('select-rule-or-adjust-filters-deals')}
        />
      )}
    </RecordTable.Provider>
  );
};

export const DEAL_MOVEMENT_RECORD_TABLE_OPTIONS = {
  sessionKey: ACCOUNTING_CHECK_SYNCED_DEAL_MOVEMENTS_SESSION_KEY,
  tableId: 'accounting_check_synced_deal_movements_record_table',
};

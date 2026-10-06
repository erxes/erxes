import {
  ACCOUNTING_CHECK_SYNCED_DEAL_MOVEMENTS_SESSION_KEY,
  ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY,
  useAccountingCheckSyncedDeals,
} from '../hooks/useAccountingCheckSyncedDeals';

import { AccountingCheckSyncedDealsCommandBar } from './AccountingCheckSyncedDealsCommandBar';
import { IconShoppingCartX } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { getAccountingCheckSyncedDealsColumns } from './AccountingCheckSyncedDealsColumns';
import { isSyncable } from '~/modules/check-synced/constants/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountingCheckSyncedDealRuleScope } from './AccountingCheckSyncedDealRuleSelect';

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
      stickyColumns={['checkbox', t('toSync'), 'name']}
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
        {!loading && deals?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('no-deals')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('select-rule-or-adjust-filters-deals')}
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

export const DEAL_MOVEMENT_RECORD_TABLE_OPTIONS = {
  sessionKey: ACCOUNTING_CHECK_SYNCED_DEAL_MOVEMENTS_SESSION_KEY,
  tableId: 'accounting_check_synced_deal_movements_record_table',
};

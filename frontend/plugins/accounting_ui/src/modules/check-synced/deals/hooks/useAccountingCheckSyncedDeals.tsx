import {
  ACCOUNTING_CHECK_SYNCED_DEALS_QUERY,
  ACCOUNTING_CHECK_SYNCED_MUTATION,
  ACCOUNTING_SYNC_DEALS_MUTATION,
} from '../graphql/checkSyncedDeals';
import {
  AccountingCheckSyncedDeal,
  AccountingCheckSyncedResponse,
  AccountingCheckSyncedStatus,
  AccountingDealsQueryResult,
  AccountingSyncResult,
} from '../types';
import {
  AccountingCheckSyncedDealsStatusCounts,
  accountingCheckSyncedDealsStatusCountsAtom,
  accountingCheckSyncedDealsTotalCountAtom,
} from '../states';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import { atom, useAtom, useSetAtom } from 'jotai';
import {
  chunkIds,
  getSyncStatus,
  useAccountingCheckSyncedAction,
  useSyncSelectedIds,
  useSyncToggle,
} from '~/modules/check-synced/constants/shared';
import { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

const ACCOUNTING_CHECK_SYNCED_DEALS_PER_PAGE = 50;
const ACCOUNTING_SYNC_DEALS_BATCH_SIZE = 1;
export const ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY =
  'accounting-check-synced-deals';

const checkedDealsAtom = atom<
  Record<string, Partial<AccountingCheckSyncedDeal>>
>({});

const toSyncDealIdsAtom = atom<Record<string, boolean>>({});

export const useAccountingCheckSyncedDealsVariables = (
  variables?: QueryHookOptions<AccountingDealsQueryResult>['variables'],
) => {
  const [
    {
      user,
      ruleId,
      stageId,
      dealSearch,
      number,
      dateType,
      dateRange,
      createdDateRange,
      stageChangedDateRange,
    },
  ] = useMultiQueryState<{
    user: string;
    ruleId: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    dealSearch: string;
    number: string;
    dateType: string;
    dateRange: string;
    createdDateRange: string;
    stageChangedDateRange: string;
  }>([
    'user',
    'ruleId',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'dateType',
    'dateRange',
    'createdDateRange',
    'stageChangedDateRange',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY,
  });

  return {
    limit: ACCOUNTING_CHECK_SYNCED_DEALS_PER_PAGE,
    noSkipArchive: true,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    userIds: user ? [user] : undefined,
    stageId: stageId || undefined,
    search: dealSearch || undefined,
    number: String(number ?? '') || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    createdStartDate: parseDateRangeFromString(createdDateRange)?.from,
    createdEndDate: parseDateRangeFromString(createdDateRange)?.to,
    stageChangedStartDate: parseDateRangeFromString(stageChangedDateRange)
      ?.from,
    stageChangedEndDate: parseDateRangeFromString(stageChangedDateRange)?.to,
    dateType: dateType || undefined,
    ruleId: ruleId || undefined,
    ...variables,
  };
};

export const useAccountingCheckSyncedDeals = (
  options?: QueryHookOptions<AccountingDealsQueryResult>,
) => {
  const { t } = useTranslation('accounting');
  const { toast } = useToast();
  const [checkedDeals, setCheckedDeals] = useAtom(checkedDealsAtom);
  const [toSyncDealIds, setToSyncDealIds] = useAtom(toSyncDealIdsAtom);
  const setTotalCount = useSetAtom(accountingCheckSyncedDealsTotalCountAtom);
  const setStatusCounts = useSetAtom(
    accountingCheckSyncedDealsStatusCountsAtom,
  );
  const variables = useAccountingCheckSyncedDealsVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery<AccountingDealsQueryResult>(
    ACCOUNTING_CHECK_SYNCED_DEALS_QUERY,
    {
      ...options,
      variables: {
        skip: options?.skip || isUndefinedOrNull(variables.cursor),
        ...variables,
      },
    },
  );

  const [accountingCheckSynced, { loading: checking }] = useMutation<{
    accountingCheckSynced: AccountingCheckSyncedResponse[];
  }>(ACCOUNTING_CHECK_SYNCED_MUTATION);

  const [accountingSyncDeals, { loading: syncing }] = useMutation<{
    accountingSyncDeals: AccountingSyncResult;
  }>(ACCOUNTING_SYNC_DEALS_MUTATION);

  const { list: rawDeals, totalCount, pageInfo } = data?.deals || {};

  const deals = useMemo(
    () =>
      (rawDeals || []).map((deal) => ({
        ...deal,
        ...checkedDeals[deal._id],
        syncStatus: getSyncStatus(checkedDeals[deal._id]),
      })),
    [checkedDeals, rawDeals],
  );

  const { setToSync: setDealToSync, setAllToSync: setAllDealsToSync } =
    useSyncToggle(setToSyncDealIds);

  const syncSelectedDealIds = useSyncSelectedIds(toSyncDealIds);

  const checkDeals = useAccountingCheckSyncedAction<AccountingCheckSyncedDeal>({
    contentType: 'sales:deal',
    setCheckedItems: setCheckedDeals,
    setToSyncIds: setToSyncDealIds,
    checkSyncedMutation: accountingCheckSynced,
    warningMsg: 'no-deals-selected',
    successMsg: 'deals-checked',
  });

  const syncDeals = async (ids: string[]) => {
    if (!variables.ruleId) {
      toast({
        title: t('warning'),
        description: t('select-rule-before-syncing-deals'),
        variant: 'destructive',
      });
      return;
    }

    const syncableIds = ids.filter(
      (id) => getSyncStatus(checkedDeals[id]) !== 'skipped',
    );

    if (!syncableIds.length) {
      toast({
        title: t('warning'),
        description: t('no-checked-deals-selected'),
        variant: 'destructive',
      });
      return;
    }

    const summary = {
      skipped: 0,
      error: 0,
      success: 0,
      resynced: 0,
    };

    for (const batchIds of chunkIds(
      syncableIds,
      ACCOUNTING_SYNC_DEALS_BATCH_SIZE,
    )) {
      const resyncedStatusById: Record<string, AccountingCheckSyncedStatus> =
        {};

      for (const id of batchIds) {
        if (checkedDeals[id]?.isSynced === true) {
          resyncedStatusById[id] = 'resynced';
        }
      }

      setCheckedDeals((current) => {
        const next = { ...current };

        for (const id of batchIds) {
          next[id] = {
            ...next[id],
            syncStatus: 'pending',
          };
        }

        return next;
      });

      const response = await accountingSyncDeals({
        variables: {
          dealIds: batchIds,
          ruleId: variables.ruleId,
          dateType: variables.dateType,
        },
        onError: (error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const result = response.data?.accountingSyncDeals;

      if (!result) {
        summary.error += batchIds.length;
        setCheckedDeals((current) => {
          const next = { ...current };

          for (const id of batchIds) {
            next[id] = { ...next[id], syncStatus: 'error' };
          }

          return next;
        });
        setAllDealsToSync(batchIds, false);

        continue;
      }

      const skippedIds = result.skipped || [];
      const errorIds = result.error || [];
      const successIds = result.success || [];
      const syncedStatusById: Record<string, AccountingCheckSyncedStatus> = {};

      for (const id of successIds) {
        syncedStatusById[id] = resyncedStatusById[id] || 'synced';
      }

      summary.skipped += skippedIds.length;
      summary.error += errorIds.length;
      summary.success += successIds.length;
      summary.resynced += successIds.filter(
        (id) => checkedDeals[id]?.isSynced === true,
      ).length;

      setCheckedDeals((current) => {
        const next = { ...current };

        for (const id of skippedIds) {
          next[id] = { ...next[id], syncStatus: 'skipped' };
        }

        for (const id of errorIds) {
          next[id] = { ...next[id], syncStatus: 'error' };
        }

        for (const id of successIds) {
          next[id] = {
            ...next[id],
            isSynced: true,
            syncStatus: current[id]?.isSynced ? 'resynced' : 'synced',
          };
        }

        return next;
      });

      if (successIds.length) {
        await checkDeals(successIds, {
          silent: true,
          keepToSyncIds: true,
          statusById: syncedStatusById,
        });
      }

      setToSyncDealIds((current) => {
        const idsToRemove = new Set([
          ...skippedIds,
          ...errorIds,
          ...successIds,
        ]);
        const next: Record<string, boolean> = {};

        for (const [key, value] of Object.entries(current)) {
          if (!idsToRemove.has(key)) {
            next[key] = value;
          }
        }

        return next;
      });
    }

    const syncedCount = summary.success - summary.resynced;

    toast({
      title: t('sync-complete'),
      description: t('sync-summary', {
        synced: syncedCount,
        resynced: summary.resynced,
        failed: summary.error,
        skipped: summary.skipped,
      }),
    });
  };

  useEffect(() => {
    setTotalCount(totalCount ?? null);
  }, [setTotalCount, totalCount]);

  useEffect(() => {
    setCheckedDeals({});
    setToSyncDealIds({});
  }, [variables.ruleId, setCheckedDeals, setToSyncDealIds]);

  useEffect(() => {
    const counts = deals.reduce<AccountingCheckSyncedDealsStatusCounts>(
      (acc, deal) => {
        const status = getSyncStatus(deal);

        acc[status] += 1;

        return acc;
      },
      {
        checked: 0,
        synced: 0,
        skipped: 0,
        pending: 0,
        error: 0,
        resynced: 0,
        toSync: syncSelectedDealIds.length,
      },
    );

    setStatusCounts(counts);
  }, [deals, setStatusCounts, syncSelectedDealIds.length]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ACCOUNTING_CHECK_SYNCED_DEALS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.deals || !prev.deals) {
          return prev;
        }

        return {
          ...prev,
          deals: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.deals,
              prevResult: prev.deals,
            }),
            totalCount: fetchMoreResult.deals.totalCount,
          },
        };
      },
    });
  };

  return {
    canSync: Boolean(variables.ruleId),
    checking,
    checkDeals,
    deals,
    handleFetchMore,
    loading,
    pageInfo,
    syncDeals,
    syncSelectedDealIds,
    syncing,
    setAllDealsToSync,
    setDealToSync,
    totalCount,
    toSyncDealIds,
  };
};

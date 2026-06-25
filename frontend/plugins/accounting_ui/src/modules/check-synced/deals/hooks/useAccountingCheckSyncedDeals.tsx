import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
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
import { useTranslation } from 'react-i18next';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
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

const ACCOUNTING_CHECK_SYNCED_DEALS_PER_PAGE = 50;
const ACCOUNTING_SYNC_DEALS_BATCH_SIZE = 1;
export const ACCOUNTING_CHECK_SYNCED_DEALS_SESSION_KEY =
  'accounting-check-synced-deals';

const checkedDealsAtom = atom<
  Record<string, Partial<AccountingCheckSyncedDeal>>
>({});

const toSyncDealIdsAtom = atom<Record<string, boolean>>({});

type CheckDealsOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, AccountingCheckSyncedStatus>;
};

const getDealStatus = (
  deal?: Partial<AccountingCheckSyncedDeal>,
): AccountingCheckSyncedStatus => deal?.syncStatus || 'skipped';

const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};

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
        syncStatus: getDealStatus(checkedDeals[deal._id]),
      })),
    [checkedDeals, rawDeals],
  );

  const syncSelectedDealIds = useMemo(
    () =>
      Object.entries(toSyncDealIds)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [toSyncDealIds],
  );

  const setDealToSync = useCallback(
    (id: string, checked: boolean) => {
      setToSyncDealIds((current) => {
        const next = { ...current };

        if (checked) {
          next[id] = true;
        } else {
          delete next[id];
        }

        return next;
      });
    },
    [setToSyncDealIds],
  );

  const setAllDealsToSync = useCallback(
    (ids: string[], checked: boolean) => {
      setToSyncDealIds((current) => {
        const next = { ...current };

        for (const id of ids) {
          if (checked) {
            next[id] = true;
          } else {
            delete next[id];
          }
        }

        return next;
      });
    },
    [setToSyncDealIds],
  );

  const checkDeals = async (
    ids: string[],
    checkOptions?: CheckDealsOptions,
  ) => {
    if (!ids.length) {
      if (!checkOptions?.silent) {
        toast({
          title: t('warning'),
          description: t('no-deals-selected'),
          variant: 'destructive',
        });
      }
      return;
    }

    const response = await accountingCheckSynced({
      variables: { ids, contentType: 'sales:deal' },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    const checked = response.data?.accountingCheckSynced || [];

    setCheckedDeals((current) => {
      const next = { ...current };

      for (const item of checked) {
        const syncStatus =
          checkOptions?.statusById?.[item._id] ||
          (item.isSynced ? 'synced' : 'checked');

        next[item._id] = {
          isSynced: item.isSynced,
          syncStatus,
          syncedDate: item.syncedDate,
          syncedBillNumber: item.syncedBillNumber,
          syncedCustomer: item.syncedCustomer,
        };
      }

      return next;
    });

    setToSyncDealIds((current) => {
      const next = { ...current };

      for (const item of checked) {
        if (checkOptions?.keepToSyncIds) {
          continue;
        }

        if (item.isSynced) {
          delete next[item._id];
        } else {
          next[item._id] = true;
        }
      }

      return next;
    });

    if (!checkOptions?.silent) {
      toast({
        title: t('success'),
        description: t('deals-checked', { count: checked.length }),
      });
    }
  };

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
      (id) => getDealStatus(checkedDeals[id]) !== 'skipped',
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
        const next = { ...current };

        for (const id of [...skippedIds, ...errorIds, ...successIds]) {
          delete next[id];
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
    const counts = deals.reduce<AccountingCheckSyncedDealsStatusCounts>(
      (acc, deal) => {
        const status = getDealStatus(deal);

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

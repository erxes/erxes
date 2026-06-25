import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
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
  checkSyncedMutation,
  syncDealsMutation,
} from '../../shared/graphql/mutations/checkSyncedMutations';
import { checkSyncedDealsQuery } from '../graphql/queries/checkSyncedDealsQuery';
import {
  CheckSyncedDealsStatusCounts,
  checkSyncedDealsStatusCountsAtom,
  checkSyncedDealsTotalCountAtom,
} from '../states/checkSyncedDealsCounts';
import {
  CheckSyncedDealStatus,
  ICheckSyncedDeals,
} from '../types/checkSyncedDeals';
import { useCheckSyncedDealsLeadSessionKey } from './useCheckSyncedDealsLeadSessionKey';

export const CHECK_SYNCED_DEALS_PER_PAGE = 50;
const SYNC_DEALS_BATCH_SIZE = 1;

type CheckSyncedResponse = {
  _id: string;
  isSynced?: boolean;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

type SyncDealsResult = {
  skipped?: string[];
  error?: string[];
  success?: string[];
};

type CheckDealsOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, CheckSyncedDealStatus>;
};

const checkedDealsAtom = atom<Record<string, Partial<ICheckSyncedDeals>>>({});

const toSyncDealIdsAtom = atom<Record<string, boolean>>({});

const getDealStatus = (
  deal?: Partial<ICheckSyncedDeals>,
): CheckSyncedDealStatus => {
  if (deal?.syncStatus) {
    return deal.syncStatus;
  }

  return 'skipped';
};

const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};

export const useCheckSyncedDealsVariables = (
  variables?: QueryHookOptions<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [
    {
      user,
      stageId,
      dealSearch,
      number,
      stageChangedDateRange,
      dateType,
      dateRange,
      createdDateRange,
    },
  ] = useMultiQueryState<{
    user: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    dealSearch: string;
    number: string;
    stageChangedDateRange: string;
    dateType: string;
    dateRange: string;
    createdDateRange: string;
  }>([
    'user',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'stageChangedDateRange',
    'dateType',
    'dateRange',
    'createdDateRange',
  ]);
  const { sessionKey } = useCheckSyncedDealsLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: CHECK_SYNCED_DEALS_PER_PAGE,
    noSkipArchive: true,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    number: String(number ?? '') || undefined,
    search: dealSearch || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    createdStartDate: parseDateRangeFromString(createdDateRange)?.from,
    createdEndDate: parseDateRangeFromString(createdDateRange)?.to,
    dateType: dateType || undefined,
    type: 'checkSyncedDeals',

    userIds: user ? [user] : undefined,
    stageId: stageId || undefined,
    stageChangedStartDate: parseDateRangeFromString(stageChangedDateRange)
      ?.from,
    stageChangedEndDate: parseDateRangeFromString(stageChangedDateRange)?.to,
    ...variables,
  };
};
export const useCheckSyncedDeals = (options?: QueryHookOptions) => {
  const { t } = useTranslation('mongolian');
  const setCheckSyncedDealsTotalCount = useSetAtom(
    checkSyncedDealsTotalCountAtom,
  );
  const setCheckSyncedDealsStatusCounts = useSetAtom(
    checkSyncedDealsStatusCountsAtom,
  );
  const [checkedDeals, setCheckedDeals] = useAtom(checkedDealsAtom);
  const [toSyncDealIds, setToSyncDealIds] = useAtom(toSyncDealIdsAtom);
  const [toCheckSynced, { loading: checking }] = useMutation<{
    toCheckSynced: CheckSyncedResponse[];
  }>(checkSyncedMutation);
  const [toSyncDeals, { loading: syncing }] = useMutation<{
    toSyncDeals: SyncDealsResult;
  }>(syncDealsMutation);
  const { toast } = useToast();
  const variables = useCheckSyncedDealsVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(checkSyncedDealsQuery, {
    ...options,
    variables: {
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      ...variables,
    },
  });

  const { list: rawDeals, totalCount, pageInfo } = data?.deals || {};
  const Deals = useMemo(
    () =>
      (rawDeals || []).map((deal) => ({
        ...deal,
        ...checkedDeals[deal._id],
        syncStatus: getDealStatus(checkedDeals[deal._id]),
      })),
    [rawDeals, checkedDeals],
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
          description: t('no-deals-to-check'),
          variant: 'destructive',
        });
      }
      return;
    }

    const response = await toCheckSynced({
      variables: { ids, contentType: 'sales:deal' },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    if (!response.data) {
      return;
    }

    const checked = response.data?.toCheckSynced || [];
    const nextChecked: Record<string, Partial<ICheckSyncedDeals>> = {};

    for (const item of checked) {
      const syncStatus: CheckSyncedDealStatus =
        checkOptions?.statusById?.[item._id] ||
        (item.isSynced ? 'synced' : 'checked');

      nextChecked[item._id] = {
        isSynced: item.isSynced,
        syncStatus,
        unSynced: syncStatus,
        syncedDate: item.syncedDate,
        syncedBillNumber: item.syncedBillNumber,
        syncedCustomer: item.syncedCustomer,
      };
    }

    setCheckedDeals((current) => ({ ...current, ...nextChecked }));
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

  const syncUncheckedDeals = async (ids: string[]) => {
    const syncableIds = ids.filter(
      (id) => getDealStatus(checkedDeals[id]) !== 'skipped',
    );

    if (!syncableIds.length) {
      toast({
        title: t('warning'),
        description: t('no-checked-deals-to-sync'),
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

    for (const batchIds of chunkIds(syncableIds, SYNC_DEALS_BATCH_SIZE)) {
      const resyncedStatusById: Record<string, CheckSyncedDealStatus> = {};

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
            unSynced: 'pending',
          };
        }

        return next;
      });

      const response = await toSyncDeals({
        variables: {
          dealIds: batchIds,
          configStageId: variables.stageId,
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

      const result = response.data?.toSyncDeals;

      if (!result) {
        summary.error += batchIds.length;
        setCheckedDeals((current) => {
          const next = { ...current };

          for (const id of batchIds) {
            next[id] = {
              ...next[id],
              syncStatus: 'error',
              unSynced: 'error',
            };
          }

          return next;
        });
        setAllDealsToSync(batchIds, false);

        continue;
      }

      const skippedIds = result?.skipped || [];
      const errorIds = result?.error || [];
      const successIds = result?.success || [];
      const syncedStatusById: Record<string, CheckSyncedDealStatus> = {};

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
          next[id] = {
            ...next[id],
            syncStatus: 'skipped',
            unSynced: 'skipped',
          };
        }

        for (const id of errorIds) {
          next[id] = {
            ...next[id],
            syncStatus: 'error',
            unSynced: 'error',
          };
        }

        for (const id of successIds) {
          const wasSynced = current[id]?.isSynced === true;
          const syncStatus = wasSynced ? 'resynced' : 'synced';

          next[id] = {
            ...next[id],
            isSynced: true,
            syncStatus,
            unSynced: syncStatus,
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
      description: t('synced-summary', {
        synced: syncedCount,
        resynced: summary.resynced,
        error: summary.error,
        skipped: summary.skipped,
      }),
    });
  };

  useEffect(() => {
    if (!totalCount) return;
    setCheckSyncedDealsTotalCount(totalCount);
  }, [totalCount, setCheckSyncedDealsTotalCount]);

  useEffect(() => {
    const counts = Deals.reduce<CheckSyncedDealsStatusCounts>(
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

    setCheckSyncedDealsStatusCounts(counts);
  }, [Deals, setCheckSyncedDealsStatusCounts, syncSelectedDealIds.length]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CHECK_SYNCED_DEALS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
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
    loading,
    Deals,
    totalCount,
    checkDeals,
    syncUncheckedDeals,
    checking,
    syncing,
    toSyncDealIds,
    setDealToSync,
    setAllDealsToSync,
    syncSelectedDealIds,
    handleFetchMore,
    pageInfo,
  };
};

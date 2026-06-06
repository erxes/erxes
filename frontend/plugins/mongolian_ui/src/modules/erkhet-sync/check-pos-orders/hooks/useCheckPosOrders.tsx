import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  parseDateRangeFromString,
  useMultiQueryState,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { checkPosOrdersQuery } from '../graphql/queries/checkPosOrdersQuery';
import {
  CheckPosOrderStatus,
  ICheckPosOrders,
} from '../types/checkPosOrders';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  CheckPosOrdersStatusCounts,
  checkPosOrdersStatusCountsAtom,
  checkPosOrdersTotalCountAtom,
} from '../states/checkPosOrdersDealsCounts';
import {
  checkSyncedMutation,
  syncOrdersMutation,
} from '../../shared/graphql/mutations/checkSyncedMutations';

export const CHECK_POS_ORDERS_PER_PAGE = 30;
const SYNC_POS_ORDERS_BATCH_SIZE = 1;

type CheckSyncedResponse = {
  _id: string;
  isSynced?: boolean;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

type SyncOrdersResult = {
  skipped?: string[];
  error?: string[];
  success?: string[];
};

type CheckOrdersOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, CheckPosOrderStatus>;
};

type CheckPosOrdersQueryResult = {
  posOrders: ICheckPosOrders[];
  posOrdersTotalCount: number;
};

const checkedOrdersAtom = atom<Record<string, Partial<ICheckPosOrders>>>({});

const toSyncOrderIdsAtom = atom<Record<string, boolean>>({});

const getOrderStatus = (
  order?: Partial<ICheckPosOrders>,
): CheckPosOrderStatus => {
  if (order?.syncStatus) {
    return order.syncStatus;
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

export const useCheckPosOrdersVariables = (
  variables?: QueryHookOptions<ICheckPosOrders[]>['variables'],
) => {
  const [
    { posToken, pos, user, paidDateRange, createdDateRange, searchValue },
  ] = useMultiQueryState<{
    posToken: string;
    pos: string;
    user: string;
    paidDateRange: string;
    createdDateRange: string;
    searchValue: string;
  }>([
    'posToken',
    'pos',
    'user',
    'paidDateRange',
    'createdDateRange',
    'searchValue',
  ]);
  const [number] = useQueryState<string>('number');

  const paidDateParsed = paidDateRange
    ? parseDateRangeFromString(paidDateRange)
    : null;
  const createdDateParsed = createdDateRange
    ? parseDateRangeFromString(createdDateRange)
    : null;

  const finalVariables = {
    perPage: CHECK_POS_ORDERS_PER_PAGE,
    sortField: 'createdAt',
    sortDirection: -1,
    search: (() => {
      const searchParts = [];
      if (searchValue) searchParts.push(searchValue);
      if (number) searchParts.push(number);
      return searchParts.length > 0 ? searchParts.join(' ') : undefined;
    })(),
    posId: pos || undefined,
    userId: user || undefined,
    ...(posToken && { posToken }),
    ...(paidDateParsed && {
      paidStartDate: paidDateParsed.from,
      paidEndDate: paidDateParsed.to,
    }),
    ...(createdDateParsed && {
      createdStartDate: createdDateParsed.from,
      createdEndDate: createdDateParsed.to,
    }),
    ...variables,
  };

  return finalVariables;
};

export const useCheckPosOrders = (options?: QueryHookOptions) => {
  const setCheckPosOrdersTotalCount = useSetAtom(checkPosOrdersTotalCountAtom);
  const setCheckPosOrdersStatusCounts = useSetAtom(
    checkPosOrdersStatusCountsAtom,
  );
  const [checkedOrders, setCheckedOrders] = useAtom(checkedOrdersAtom);
  const [toSyncOrderIds, setToSyncOrderIds] = useAtom(toSyncOrderIdsAtom);
  const [toCheckSynced, { loading: checking }] = useMutation<{
    toCheckSynced: CheckSyncedResponse[];
  }>(checkSyncedMutation);
  const [toSyncOrders, { loading: syncing }] = useMutation<{
    toSyncOrders: SyncOrdersResult;
  }>(syncOrdersMutation);
  const { toast } = useToast();
  const variables = useCheckPosOrdersVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery<CheckPosOrdersQueryResult>(
    checkPosOrdersQuery,
    {
      ...options,
      variables,
      fetchPolicy: 'cache-and-network',
    },
  );

  const checkPosOrders = useMemo(
    () =>
      (data?.posOrders || []).map((order) => ({
        ...order,
        ...checkedOrders[order._id],
        syncStatus: getOrderStatus(checkedOrders[order._id]),
      })),
    [checkedOrders, data?.posOrders],
  );
  const totalCount = data?.posOrdersTotalCount || 0;

  const syncSelectedOrderIds = useMemo(
    () =>
      Object.entries(toSyncOrderIds)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [toSyncOrderIds],
  );

  const setOrderToSync = useCallback((id: string, checked: boolean) => {
    setToSyncOrderIds((current) => {
      const next = { ...current };

      if (checked) {
        next[id] = true;
      } else {
        delete next[id];
      }

      return next;
    });
  }, [setToSyncOrderIds]);

  const setAllOrdersToSync = useCallback((ids: string[], checked: boolean) => {
    setToSyncOrderIds((current) => {
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
  }, [setToSyncOrderIds]);

  const checkOrders = async (
    ids: string[],
    checkOptions?: CheckOrdersOptions,
  ) => {
    if (!ids.length) {
      if (!checkOptions?.silent) {
        toast({
          title: 'Warning',
          description: 'No orders to check',
          variant: 'destructive',
        });
      }
      return;
    }

    const response = await toCheckSynced({
      variables: { ids, contentType: 'pos:order' },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    if (!response.data) {
      return;
    }

    const checked = response.data?.toCheckSynced || [];
    const nextChecked: Record<string, Partial<ICheckPosOrders>> = {};

    for (const item of checked) {
      const syncStatus: CheckPosOrderStatus =
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

    setCheckedOrders((current) => ({ ...current, ...nextChecked }));
    setToSyncOrderIds((current) => {
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
        title: 'Success',
        description: `${checked.length} orders checked`,
      });
    }
  };

  const syncUncheckedOrders = async (ids: string[]) => {
    const syncableIds = ids.filter(
      (id) => getOrderStatus(checkedOrders[id]) !== 'skipped',
    );

    if (!syncableIds.length) {
      toast({
        title: 'Warning',
        description: 'No checked orders to sync',
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

    for (const batchIds of chunkIds(syncableIds, SYNC_POS_ORDERS_BATCH_SIZE)) {
      const resyncedStatusById: Record<string, CheckPosOrderStatus> = {};

      for (const id of batchIds) {
        if (checkedOrders[id]?.isSynced === true) {
          resyncedStatusById[id] = 'resynced';
        }
      }

      setCheckedOrders((current) => {
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

      const response = await toSyncOrders({
        variables: { orderIds: batchIds },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const result = response.data?.toSyncOrders;

      if (!result) {
        summary.error += batchIds.length;
        setCheckedOrders((current) => {
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
        setAllOrdersToSync(batchIds, false);

        continue;
      }

      const skippedIds = result.skipped || [];
      const errorIds = result.error || [];
      const successIds = result.success || [];
      const syncedStatusById: Record<string, CheckPosOrderStatus> = {};

      for (const id of successIds) {
        syncedStatusById[id] = resyncedStatusById[id] || 'synced';
      }

      summary.skipped += skippedIds.length;
      summary.error += errorIds.length;
      summary.success += successIds.length;
      summary.resynced += successIds.filter(
        (id) => checkedOrders[id]?.isSynced === true,
      ).length;

      setCheckedOrders((current) => {
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
        await checkOrders(successIds, {
          silent: true,
          keepToSyncIds: true,
          statusById: syncedStatusById,
        });
      }

      setToSyncOrderIds((current) => {
        const next = { ...current };

        for (const id of [...skippedIds, ...errorIds, ...successIds]) {
          delete next[id];
        }

        return next;
      });
    }

    const syncedCount = summary.success - summary.resynced;

    toast({
      title: 'Sync complete',
      description: `${syncedCount} synced, ${summary.resynced} resynced, ${summary.error} failed, ${summary.skipped} skipped`,
    });
  };

  useEffect(() => {
    if (!totalCount) return;
    setCheckPosOrdersTotalCount(totalCount);
  }, [totalCount, setCheckPosOrdersTotalCount]);

  useEffect(() => {
    const counts = checkPosOrders.reduce<CheckPosOrdersStatusCounts>(
      (acc, order) => {
        const status = getOrderStatus(order);

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
        toSync: syncSelectedOrderIds.length,
      },
    );

    setCheckPosOrdersStatusCounts(counts);
  }, [
    checkPosOrders,
    setCheckPosOrdersStatusCounts,
    syncSelectedOrderIds.length,
  ]);

  const handleFetchMore = () => {
    const currentPage = Math.ceil(
      checkPosOrders.length / CHECK_POS_ORDERS_PER_PAGE,
    );

    fetchMore({
      variables: {
        ...variables,
        page: currentPage + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          posOrders: [...prev.posOrders, ...fetchMoreResult.posOrders],
          posOrdersTotalCount: fetchMoreResult.posOrdersTotalCount,
        };
      },
    });
  };

  return {
    loading,
    checkPosOrders,
    totalCount,
    checkOrders,
    syncUncheckedOrders,
    checking,
    syncing,
    toSyncOrderIds,
    setOrderToSync,
    setAllOrdersToSync,
    syncSelectedOrderIds,
    handleFetchMore,
    pageInfo: {
      hasNextPage: checkPosOrders.length < totalCount,
      hasPreviousPage: false,
    },
  };
};

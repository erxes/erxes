import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  parseDateRangeFromString,
  useMultiQueryState,
  useToast,
} from 'erxes-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import {
  ACCOUNTING_CHECK_SYNCED_ORDERS_MUTATION,
  ACCOUNTING_CHECK_SYNCED_ORDERS_QUERY,
  ACCOUNTING_SYNC_ORDERS_MUTATION,
} from '../graphql/checkSyncedOrders';
import {
  AccountingCheckSyncedOrder,
  AccountingCheckSyncedResponse,
  AccountingCheckSyncedStatus,
  AccountingOrdersQueryResult,
  AccountingSyncResult,
} from '../types';
import {
  AccountingCheckSyncedOrdersStatusCounts,
  accountingCheckSyncedOrdersStatusCountsAtom,
  accountingCheckSyncedOrdersTotalCountAtom,
} from '../states';

const ACCOUNTING_SYNC_ORDERS_BATCH_SIZE = 1;
const ACCOUNTING_CHECK_SYNCED_ORDERS_PER_PAGE = 50;
export const ACCOUNTING_CHECK_SYNCED_ORDERS_SESSION_KEY =
  'accounting-check-synced-orders';

const checkedOrdersAtom = atom<
  Record<string, Partial<AccountingCheckSyncedOrder>>
>({});

const toSyncOrderIdsAtom = atom<Record<string, boolean>>({});

type CheckOrdersOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, AccountingCheckSyncedStatus>;
};

const getOrderStatus = (
  order?: Partial<AccountingCheckSyncedOrder>,
): AccountingCheckSyncedStatus => order?.syncStatus || 'skipped';

const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};

export const useAccountingCheckSyncedOrdersVariables = (
  variables?: QueryHookOptions<AccountingOrdersQueryResult>['variables'],
) => {
  const [
    { orderRuleId, pos, searchValue, number, paidDateRange, createdDateRange },
  ] = useMultiQueryState<{
    orderRuleId: string;
    pos: string;
    searchValue: string;
    number: string;
    paidDateRange: string;
    createdDateRange: string;
  }>([
    'orderRuleId',
    'pos',
    'searchValue',
    'number',
    'paidDateRange',
    'createdDateRange',
  ]);

  const search = [searchValue, number].filter(Boolean).join(' ') || undefined;

  return {
    perPage: ACCOUNTING_CHECK_SYNCED_ORDERS_PER_PAGE,
    sortField: 'createdAt',
    sortDirection: -1,
    posId: pos || undefined,
    search,
    paidStartDate: parseDateRangeFromString(paidDateRange)?.from,
    paidEndDate: parseDateRangeFromString(paidDateRange)?.to,
    createdStartDate: parseDateRangeFromString(createdDateRange)?.from,
    createdEndDate: parseDateRangeFromString(createdDateRange)?.to,
    ruleId: orderRuleId || undefined,
    ...variables,
  };
};

export const useAccountingCheckSyncedOrders = (
  options?: QueryHookOptions<AccountingOrdersQueryResult>,
) => {
  const { toast } = useToast();
  const [checkedOrders, setCheckedOrders] = useAtom(checkedOrdersAtom);
  const [toSyncOrderIds, setToSyncOrderIds] = useAtom(toSyncOrderIdsAtom);
  const setTotalCount = useSetAtom(accountingCheckSyncedOrdersTotalCountAtom);
  const setStatusCounts = useSetAtom(
    accountingCheckSyncedOrdersStatusCountsAtom,
  );
  const variables = useAccountingCheckSyncedOrdersVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<AccountingOrdersQueryResult>(
    ACCOUNTING_CHECK_SYNCED_ORDERS_QUERY,
    {
      ...options,
      variables,
      fetchPolicy: 'cache-and-network',
    },
  );

  const [accountingCheckSynced, { loading: checking }] = useMutation<{
    accountingCheckSynced: AccountingCheckSyncedResponse[];
  }>(ACCOUNTING_CHECK_SYNCED_ORDERS_MUTATION);

  const [accountingSyncOrders, { loading: syncing }] = useMutation<{
    accountingSyncOrders: AccountingSyncResult;
  }>(ACCOUNTING_SYNC_ORDERS_MUTATION);

  const orders = useMemo(
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

  const setOrderToSync = useCallback(
    (id: string, checked: boolean) => {
      setToSyncOrderIds((current) => {
        const next = { ...current };

        if (checked) {
          next[id] = true;
        } else {
          delete next[id];
        }

        return next;
      });
    },
    [setToSyncOrderIds],
  );

  const setAllOrdersToSync = useCallback(
    (ids: string[], checked: boolean) => {
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
    },
    [setToSyncOrderIds],
  );

  const checkOrders = async (
    ids: string[],
    checkOptions?: CheckOrdersOptions,
  ) => {
    if (!ids.length) {
      if (!checkOptions?.silent) {
        toast({
          title: 'Warning',
          description: 'No orders selected',
          variant: 'destructive',
        });
      }
      return;
    }

    const response = await accountingCheckSynced({
      variables: { ids, contentType: 'sales:order' },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    const checked = response.data?.accountingCheckSynced || [];

    setCheckedOrders((current) => {
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

  const syncOrders = async (ids: string[]) => {
    if (!variables.ruleId) {
      toast({
        title: 'Warning',
        description: 'Select a rule before syncing orders',
        variant: 'destructive',
      });
      return;
    }

    const syncableIds = ids.filter(
      (id) => getOrderStatus(checkedOrders[id]) !== 'skipped',
    );

    if (!syncableIds.length) {
      toast({
        title: 'Warning',
        description: 'No checked orders selected',
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
      ACCOUNTING_SYNC_ORDERS_BATCH_SIZE,
    )) {
      const resyncedStatusById: Record<string, AccountingCheckSyncedStatus> =
        {};

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
          };
        }

        return next;
      });

      const response = await accountingSyncOrders({
        variables: {
          orderIds: batchIds,
          ruleId: variables.ruleId,
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const result = response.data?.accountingSyncOrders;

      if (!result) {
        summary.error += batchIds.length;
        setCheckedOrders((current) => {
          const next = { ...current };

          for (const id of batchIds) {
            next[id] = { ...next[id], syncStatus: 'error' };
          }

          return next;
        });
        setAllOrdersToSync(batchIds, false);

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
        (id) => checkedOrders[id]?.isSynced === true,
      ).length;

      setCheckedOrders((current) => {
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
    setTotalCount(data?.posOrdersTotalCount ?? null);
  }, [data?.posOrdersTotalCount, setTotalCount]);

  useEffect(() => {
    const counts = orders.reduce<AccountingCheckSyncedOrdersStatusCounts>(
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

    setStatusCounts(counts);
  }, [orders, setStatusCounts, syncSelectedOrderIds.length]);

  const handleFetchMore = () => {
    const currentPage = Math.ceil(
      orders.length / ACCOUNTING_CHECK_SYNCED_ORDERS_PER_PAGE,
    );

    fetchMore({
      variables: {
        ...variables,
        page: currentPage + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          posOrders: [
            ...(prev.posOrders || []),
            ...(fetchMoreResult.posOrders || []),
          ],
          posOrdersTotalCount: fetchMoreResult.posOrdersTotalCount,
        };
      },
    });
  };

  return {
    canSync: Boolean(variables.ruleId),
    checkOrders,
    checking,
    handleFetchMore,
    loading,
    orders,
    pageInfo: {
      hasNextPage: orders.length < totalCount,
      hasPreviousPage: false,
    },
    setAllOrdersToSync,
    setOrderToSync,
    syncOrders,
    syncSelectedOrderIds,
    syncing,
    toSyncOrderIds,
    totalCount,
  };
};

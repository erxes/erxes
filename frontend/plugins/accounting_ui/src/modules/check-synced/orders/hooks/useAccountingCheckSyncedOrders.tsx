import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  parseDateRangeFromString,
  useMultiQueryState,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
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
  getSyncStatus,
  chunkIds,
  useSyncToggle,
  useSyncSelectedIds,
  useAccountingCheckSyncedAction,
} from '../../constants/shared';
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

/** check-synced orders query variable barih */
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

/** check-synced orders query mutation hook bn */
export const useAccountingCheckSyncedOrders = (
  options?: QueryHookOptions<AccountingOrdersQueryResult>,
) => {
  const { t } = useTranslation('accounting');
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
        syncStatus: getSyncStatus(checkedOrders[order._id]),
      })),
    [checkedOrders, data?.posOrders],
  );
  const totalCount = data?.posOrdersTotalCount || 0;

  const { setToSync: setOrderToSync, setAllToSync: setAllOrdersToSync } =
    useSyncToggle(setToSyncOrderIds);

  const syncSelectedOrderIds = useSyncSelectedIds(toSyncOrderIds);

  /** songogdson orders sync status shalgah */
  const checkOrders =
    useAccountingCheckSyncedAction<AccountingCheckSyncedOrder>({
      contentType: 'sales:order',
      setCheckedItems: setCheckedOrders,
      setToSyncIds: setToSyncOrderIds,
      checkSyncedMutation: accountingCheckSynced,
      warningMsg: 'no-orders-selected',
      successMsg: 'orders-checked',
    });

  /** orders-iig accounting sync hiih */
  const syncOrders = async (ids: string[]) => {
    if (!variables.ruleId) {
      toast({
        title: t('warning'),
        description: t('select-rule-before-syncing-orders'),
        variant: 'destructive',
      });
      return;
    }

    const syncableIds = ids.filter(
      (id) => getSyncStatus(checkedOrders[id]) !== 'skipped',
    );

    if (!syncableIds.length) {
      toast({
        title: t('warning'),
        description: t('no-checked-orders-selected'),
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
            title: t('error'),
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
    setTotalCount(data?.posOrdersTotalCount ?? null);
  }, [data?.posOrdersTotalCount, setTotalCount]);

  useEffect(() => {
    setCheckedOrders({});
    setToSyncOrderIds({});
  }, [variables.ruleId, setCheckedOrders, setToSyncOrderIds]);

  useEffect(() => {
    const counts = orders.reduce<AccountingCheckSyncedOrdersStatusCounts>(
      (acc, order) => {
        const status = getSyncStatus(order);

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

  /** orders ihuu tatah pagination oor */
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

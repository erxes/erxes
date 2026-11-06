import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { drillPeriod, useLoyaltyDrill } from '@/loyalty-points/drill';
import {
  TScoreLogEntry,
  useScoreLogsByIds,
} from '@/loyalty-points/hooks/useScoreLogsByIds';
import { SALES_POS_SCORE_LOGS } from '../graphql';
import { usePosLoyaltyVariables } from './usePosLoyaltyVariables';

const PER_PAGE = 50;

export type TPosScoreLogRow = {
  // The entry's own id; one entry belongs to one order.
  _id: string;
  orderId: string;
  orderNumber?: string | null;
  posName?: string | null;
  branchId?: string | null;
  scoreLogId: string;
  log?: TScoreLogEntry;
};

/** The loyalty entries the matching orders caused, 50 at a time. */
export const usePosScoreLogs = () => {
  const filters = usePosLoyaltyVariables();
  const drill = useLoyaltyDrill()?.drill;
  // The opened sum narrows the page's filters.
  const drilled = {
    ...(drill?.groupId ? { posIds: [drill.groupId] } : {}),
    ...(drill?.customerId ? { customerId: drill.customerId } : {}),
    ...(drill?.personId ? { userId: drill.personId } : {}),
    ...(drill?.branchId ? { branchIds: [drill.branchId] } : {}),
    ...(drill?.recordId ? { orderIds: [drill.recordId] } : {}),
    kind: drill?.kind,
    period: drillPeriod(drill),
  };
  const { data, loading, error, fetchMore, refetch } = useQuery(
    SALES_POS_SCORE_LOGS,
    {
      variables: { ...filters, ...drilled, page: 1, perPage: PER_PAGE },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const entries = useMemo(
    () => data?.salesPosScoreLogs?.list?.filter(isDefined) || [],
    [data],
  );
  const totalCount = data?.salesPosScoreLogs?.totalCount || 0;
  const scoreLogs = useScoreLogsByIds(entries.map((e) => e.scoreLogId));

  const rows: TPosScoreLogRow[] = entries.map((entry) => ({
    ...entry,
    _id: entry.scoreLogId,
    log: scoreLogs.logs.get(entry.scoreLogId),
  }));

  const handleFetchMore = () => {
    if (loading || entries.length >= totalCount) {
      return;
    }

    fetchMore({
      variables: { page: Math.floor(entries.length / PER_PAGE) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.salesPosScoreLogs) {
          return prev;
        }

        return {
          salesPosScoreLogs: {
            ...fetchMoreResult.salesPosScoreLogs,
            list: [
              ...(prev.salesPosScoreLogs?.list || []),
              ...(fetchMoreResult.salesPosScoreLogs.list || []),
            ],
          },
        };
      },
    });
  };

  return {
    rows,
    totalCount,
    loading: loading && !entries.length,
    logsLoading: scoreLogs.loading,
    error: error || scoreLogs.error,
    hasNextPage: entries.length < totalCount,
    handleFetchMore,
    retry: () => {
      scoreLogs.reset();
      refetch();
    },
  };
};

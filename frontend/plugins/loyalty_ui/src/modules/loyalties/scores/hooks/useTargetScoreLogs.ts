import { NetworkStatus, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import type { LoyaltyTargetScoreLogsQuery } from '~/gql/graphql';
import { LOYALTY_TARGET_SCORE_LOGS } from '../graphql/queries';

export type TTargetScoreLog = NonNullable<
  NonNullable<
    NonNullable<LoyaltyTargetScoreLogsQuery['scoreLogs']>['list']
  >[number]
>;

/** The points one record moved, newest first, and where they stand now. */
export const useTargetScoreLogs = (targetId?: string) => {
  const { data, loading, error, refetch, networkStatus } = useQuery(
    LOYALTY_TARGET_SCORE_LOGS,
    {
      variables: { targetId },
      skip: !targetId,
      fetchPolicy: 'cache-and-network',
      // The record's own plugin writes these (a deal moved, an order synced)
      // and loyalty hears nothing of it; asked again while open, by index.
      pollInterval: 10_000,
    },
  );

  const logs = useMemo(
    () => compactList(data?.scoreLogs?.list),
    [data?.scoreLogs?.list],
  );

  return {
    logs,
    total: logs.reduce((sum, { change }) => sum + (Number(change) || 0), 0),
    loading: loading && !logs.length,
    error,
    // Asked for by hand, not the background poll.
    refetching: networkStatus === NetworkStatus.refetch,
    refetch: () => refetch(),
  };
};

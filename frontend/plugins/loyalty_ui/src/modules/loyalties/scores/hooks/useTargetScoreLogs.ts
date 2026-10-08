import { NetworkStatus, useQuery } from '@apollo/client';
import { LOYALTY_TARGET_SCORE_LOGS } from '../graphql/queries';
import { IScoreLog } from '../types/score';

export type TTargetScoreLog = IScoreLog & {
  createdAt?: string;
  campaign?: { _id: string; title?: string } | null;
};

/** The points one record moved, newest first, and where they stand now. */
export const useTargetScoreLogs = (targetId?: string) => {
  const { data, loading, error, refetch, networkStatus } = useQuery<{
    scoreLogs?: { list?: TTargetScoreLog[] };
  }>(LOYALTY_TARGET_SCORE_LOGS, {
    variables: { targetId },
    skip: !targetId,
    fetchPolicy: 'cache-and-network',
    // The record's own plugin writes these (a deal moved, an order synced)
    // and loyalty hears nothing of it; asked again while open, by index.
    pollInterval: 10_000,
  });

  const logs = data?.scoreLogs?.list || [];

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

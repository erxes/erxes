import { useQuery } from '@apollo/client';
import { BROADCAST_RUNS } from '../graphql/queries';
import { TBroadcastRun } from '../types';

/** A campaign's runs, newest first. */
export const useBroadcastRuns = (engageMessageId?: string) => {
  const { data, loading } = useQuery<{ engageBroadcastRuns?: TBroadcastRun[] }>(
    BROADCAST_RUNS,
    { variables: { engageMessageId }, skip: !engageMessageId },
  );

  return { runs: data?.engageBroadcastRuns ?? [], loading };
};

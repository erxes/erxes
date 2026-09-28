import { useQuery } from '@apollo/client';
import { BROADCAST_TRACES } from '../graphql/queries';
import { TBroadcastTrace } from '../types';

export const useBroadcastTraces = (engageMessageId?: string) => {
  const { data, loading, error } = useQuery<{
    engageBroadcastTraces?: (TBroadcastTrace | null)[];
  }>(BROADCAST_TRACES, {
    variables: { engageMessageId },
    skip: !engageMessageId,
  });

  const traces = (data?.engageBroadcastTraces ?? []).filter(
    (trace): trace is TBroadcastTrace => !!trace,
  );

  return { traces, loading, error };
};

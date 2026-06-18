import { useQuery } from '@apollo/client';
import { MASTRA_THREADS } from '~/graphql/queries';
import { IMastraThreadsResponse } from '~/modules/chat/types';

// The agent's persisted session list, read from the Apollo cache. Optimistic
// create (on send), rename, remove, and the turn-end refetch all write into the
// same cached query, so this stays in sync without a hand-rolled store array.
export const useMastraThreads = (mastraAgentId?: string) => {
  const { data, loading } = useQuery<IMastraThreadsResponse>(MASTRA_THREADS, {
    variables: { agentId: mastraAgentId },
    skip: !mastraAgentId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    threads: data?.mastraThreads ?? [],
    // Only "still loading" before the first read resolves — background refetches
    // (turn end) keep `data`, so the sidebar skeleton never flickers back.
    loading: loading && !data,
  };
};

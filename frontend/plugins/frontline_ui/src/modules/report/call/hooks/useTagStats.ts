import { gql, useQuery } from '@apollo/client';
import { CALL_TAG_STATS } from '@/integrations/call/graphql/queries/callTagStats';
import type { TagStat } from '../types';
import { useCallFilters } from './useCallFilters';

export function useTagStats(agentExtension = 'all') {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const { data, loading, error } = useQuery<{ callGetTagStats: TagStat[] }>(
    gql(CALL_TAG_STATS),
    {
      variables: {
        startDate,
        endDate,
        queueId: queueId || undefined,
        direction: direction !== 'all' ? direction : undefined,
        agentExtension: agentExtension !== 'all' ? agentExtension : undefined,
      },
      skip: !queueId,
    },
  );

  return {
    tags: data?.callGetTagStats ?? [],
    loading,
    error,
  };
}

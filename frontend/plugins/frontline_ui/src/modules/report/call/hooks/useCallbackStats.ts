import { gql, useQuery } from '@apollo/client';
import { CALL_CALLBACK_STATS } from '@/integrations/call/graphql/queries/callStatistics';
import type { CallbackStat } from '../types';
import { useCallFilters } from './useCallFilters';

export function useCallbackStats() {
  const { startDate, endDate, integrationId, queueId } = useCallFilters();

  const { data, loading, error } = useQuery<{
    getCallbackStats: CallbackStat[];
  }>(gql(CALL_CALLBACK_STATS), {
    variables: {
      startDate,
      endDate,
      integrationId: integrationId || undefined,
      queueId: queueId && queueId !== 'all' ? queueId : undefined,
    },
    skip: !integrationId,
  });

  return {
    stats: data?.getCallbackStats ?? [],
    loading,
    error,
  };
}

import { gql, useQuery } from '@apollo/client';
import { CALL_TOP_NUMBERS } from '@/integrations/call/graphql/queries/callStatistics';
import type { TopNumber } from '../types';
import { useCallFilters } from './useCallFilters';

export function useTopNumbers(limit = 12) {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery<{ callTopNumbers: TopNumber[] }>(
    gql(CALL_TOP_NUMBERS),
    {
      variables: {
        startDate,
        endDate,
        integrationId: integrationId || undefined,
        queueId: queueId && queueId !== 'all' ? queueId : undefined,
        direction: direction !== 'all' ? direction : undefined,
        limit,
      },
      skip: !integrationId,
    },
  );

  return {
    numbers: data?.callTopNumbers ?? [],
    loading,
    error,
  };
}

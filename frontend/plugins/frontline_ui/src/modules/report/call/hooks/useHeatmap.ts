import { gql, useQuery } from '@apollo/client';
import { CALL_HEATMAP } from '@/integrations/call/graphql/queries/callStatistics';
import type { HeatCell } from '../types';
import { useCallFilters } from './useCallFilters';

export function useHeatmap() {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const { data, loading, error } = useQuery<{ callHeatmap: HeatCell[] }>(
    gql(CALL_HEATMAP),
    {
      variables: {
        startDate,
        endDate,
        queueId: queueId || undefined,
        direction: direction !== 'all' ? direction : undefined,
      },
      skip: !queueId,
    },
  );

  return {
    cells: data?.callHeatmap ?? [],
    loading,
    error,
  };
}

import { gql, useQuery } from '@apollo/client';
import { CALL_HEATMAP } from '@/integrations/call/graphql/queries/callStatistics';
import type { HeatCell } from '../types';
import { useCallFilters } from './useCallFilters';

export function useHeatmap() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery<{ callHeatmap: HeatCell[] }>(
    gql(CALL_HEATMAP),
    {
      variables: {
        startDate,
        endDate,
        integrationId: integrationId || undefined,
        queueId: queueId && queueId !== 'all' ? queueId : undefined,
        direction: direction !== 'all' ? direction : undefined,
      },
      skip: !integrationId,
    },
  );

  return {
    cells: data?.callHeatmap ?? [],
    loading,
    error,
  };
}

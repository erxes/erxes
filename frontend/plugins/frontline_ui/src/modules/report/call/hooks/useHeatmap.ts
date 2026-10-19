import { isDefined } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { CALL_HEATMAP } from '@/integrations/call/graphql/queries/callStatistics';
import { useCallFilters } from './useCallFilters';

export function useHeatmap() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery(CALL_HEATMAP, {
    variables: {
      startDate,
      endDate,
      integrationId: integrationId || undefined,
      queueId: queueId && queueId !== 'all' ? queueId : undefined,
      direction: direction !== 'all' ? direction : undefined,
    },
    skip: !integrationId,
  });

  return {
    cells: data?.callHeatmap?.filter(isDefined) ?? [],
    loading,
    error,
  };
}

import { isDefined } from 'erxes-ui';
import { useLazyQuery } from '@apollo/client';
import { CALL_HEATMAP_DAILY } from '@/integrations/call/graphql/queries/callStatistics';
import type { DayHourCell } from '../types';
import { useCallFilters } from './useCallFilters';

export function useHeatmapExport() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const [fetchDaily, { loading }] = useLazyQuery(CALL_HEATMAP_DAILY, {
    fetchPolicy: 'network-only',
  });

  const loadForExport = async (): Promise<DayHourCell[]> => {
    const { data } = await fetchDaily({
      variables: {
        startDate,
        endDate,
        integrationId: integrationId || undefined,
        queueId: queueId && queueId !== 'all' ? queueId : undefined,
        direction: direction !== 'all' ? direction : undefined,
      },
    });

    return data?.callHeatmapDaily?.filter(isDefined) ?? [];
  };

  return { loadForExport, loading };
}

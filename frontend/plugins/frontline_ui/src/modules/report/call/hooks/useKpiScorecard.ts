import { gql, useQuery } from '@apollo/client';
import { CALL_KPI_SCORECARD } from '@/integrations/call/graphql/queries/callStatistics';
import type { KpiScorecard } from '../types';
import { useCallFilters } from './useCallFilters';

export function useKpiScorecard() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();
  const skip = !integrationId;

  const { data, loading, error } = useQuery<{ callKpiScorecard: KpiScorecard }>(
    gql(CALL_KPI_SCORECARD),
    {
      variables: {
        startDate,
        endDate,
        integrationId: integrationId || undefined,
        queueId: queueId && queueId !== 'all' ? queueId : undefined,
        direction: direction !== 'all' ? direction : undefined,
      },
      skip,
    },
  );

  return {
    kpi: data?.callKpiScorecard ?? null,
    loading,
    error,
  };
}

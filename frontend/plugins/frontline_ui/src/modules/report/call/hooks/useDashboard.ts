import { useQuery } from '@apollo/client';
import { callReportsDashboard } from '@/integrations/call/graphql/queries/callStatistics';
import { useCallFilters } from './useCallFilters';

export function useDashboard() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery(callReportsDashboard, {
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
    queueStats: data?.callGetQueueStats ?? [],
    agentStats: data?.callGetAgentStats ?? [],
    loading,
    error,
  };
}

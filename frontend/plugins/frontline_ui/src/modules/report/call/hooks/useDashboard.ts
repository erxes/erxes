import { gql, useQuery } from '@apollo/client';
import { callReportsDashboard } from '@/integrations/call/graphql/queries/callStatistics';
import type { QueueStat, AgentStat } from '../types';
import { useCallFilters } from './useCallFilters';

interface DashboardData {
  callGetQueueStats: QueueStat[];
  callGetAgentStats: AgentStat[];
}

export function useDashboard() {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const { data, loading, error } = useQuery<DashboardData>(
    gql(callReportsDashboard),
    {
      variables: {
        startDate,
        endDate,
        queueId,
        direction: direction !== 'all' ? direction : undefined,
      },
      skip: !queueId,
    },
  );

  return {
    queueStats: data?.callGetQueueStats ?? [],
    agentStats: data?.callGetAgentStats ?? [],
    loading,
    error,
  };
}

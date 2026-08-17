import { CALL_AGENT_DAILY_STATS } from '@/integrations/call/graphql/queries/callAgentDailyStats';
import { ICallAgentDailyStat } from '@/integrations/call/types/callTypes';
import { useQuery } from '@apollo/client';

export const useCallAgentDailyStats = ({
  integrationId,
  queue,
  startDate,
  endDate,
}: {
  integrationId?: string;
  queue?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data, loading, refetch } = useQuery<{
    callAgentDailyStats: ICallAgentDailyStat[];
  }>(CALL_AGENT_DAILY_STATS, {
    variables: { integrationId, queue, startDate, endDate },
    skip: !integrationId || !queue,
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  });

  return {
    agentDailyStats: data?.callAgentDailyStats || [],
    loading,
    refetch,
  };
};

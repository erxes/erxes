import { AUTOMATIONS_AI_AGENT_HEALTH } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';

export type TAiAgentHealthCheckStatus = 'ok' | 'warning' | 'error' | 'skipped';

export type TAiAgentHealth = {
  ready: boolean;
  checkedAt: string;
  errors: string[];
  warnings: string[];
  checks?: Record<string, TAiAgentHealthCheckStatus>;
};

type TAiAgentHealthResponse = {
  automationsAiAgentHealth?: TAiAgentHealth;
};

export const useAiAgentHealth = (agentId?: string) => {
  const { data, loading, refetch } = useQuery<TAiAgentHealthResponse>(
    AUTOMATIONS_AI_AGENT_HEALTH,
    {
      variables: { agentId },
      skip: !agentId,
      notifyOnNetworkStatusChange: true,
    },
  );

  return {
    health: data?.automationsAiAgentHealth,
    loading,
    refetch,
  };
};

export type TAiAgentHealthState = ReturnType<typeof useAiAgentHealth>;

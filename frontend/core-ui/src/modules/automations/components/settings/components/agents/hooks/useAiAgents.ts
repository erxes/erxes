import { AUTOMATIONS_AI_AGENTS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';

type AiAgents = {
  automationsAiAgents: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    connection?: {
      provider?: string;
      model?: string;
    };
  }[];
};

export const useAiAgents = (kind?: string | null) => {
  const { data, loading } = useQuery<AiAgents>(AUTOMATIONS_AI_AGENTS, {
    variables: { kind: kind || undefined },
  });

  const { automationsAiAgents = [] } = data || {};

  return {
    automationsAiAgents,
    loading,
  };
};

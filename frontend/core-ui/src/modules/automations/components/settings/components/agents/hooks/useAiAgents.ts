import { AUTOMATIONS_AI_AGENTS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
type AiAgents = {
  automationsAiAgents: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
  }[];
};

export const useAiAgents = () => {
  const [kind] = useQueryState<string>('kind');

  const { data, loading } = useQuery<AiAgents>(AUTOMATIONS_AI_AGENTS, {
    variables: { kind: 'cloudflare' },
  });

  const { automationsAiAgents = [] } = data || {};

  return {
    automationsAiAgents,
  };
};

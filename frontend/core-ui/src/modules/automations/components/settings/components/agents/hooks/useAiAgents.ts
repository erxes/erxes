import { AUTOMATIONS_AI_AGENTS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';

export type TAiAgentRecord = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  connection?: {
    provider?: string;
    model?: string;
  };
  runtime?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  };
  context?: {
    systemPrompt?: string;
    files?: Array<{
      id?: string;
      key?: string;
      name?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
    }>;
  };
};

type AiAgents = {
  automationsAiAgents: TAiAgentRecord[];
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

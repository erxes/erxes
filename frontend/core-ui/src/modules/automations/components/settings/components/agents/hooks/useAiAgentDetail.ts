import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  AUTOMATIONS_AI_AGENT_ADD,
  AUTOMATIONS_AI_AGENT_DETAIL,
  AUTOMATIONS_AI_AGENT_EDIT,
  AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES,
  AUTOMATIONS_AI_AGENT_TOTAL_COUNTS,
} from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { toast } from 'erxes-ui';
import { useLocation, useNavigate, useParams } from 'react-router';

export interface AiAgentInput {
  name?: string;
  description?: string;
  connection?: {
    provider?: string;
    model?: string;
    config?: {
      apiKey?: string;
      baseUrl?: string;
      headers?: Record<string, string>;
      accountId?: string;
      gatewayId?: string;
      gatewayToken?: string;
      mode?: 'compat' | 'openai-provider';
    };
  };
  runtime?: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  };
  context?: {
    systemPrompt?: string;
    files?: unknown;
    knowledgeSources?: Array<{
      pluginName: string;
      moduleName: string;
      key: string;
      sourceIds: string[];
    }>;
  };
}

export function useAiAgentDetail({ skip = false }: { skip?: boolean } = {}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();

  const { data, loading } = useQuery(AUTOMATIONS_AI_AGENT_DETAIL, {
    variables: { id },
    skip: !id || skip,
  });

  const [addMutation, { loading: adding }] = useMutation(
    AUTOMATIONS_AI_AGENT_ADD,
  );
  const [editMutation, { loading: editing }] = useMutation(
    AUTOMATIONS_AI_AGENT_EDIT,
  );

  const detail = useMemo(() => data?.automationsAiAgentDetail, [data]);

  const handleSave = useCallback(
    async (input: AiAgentInput) => {
      const mutation = id ? editMutation : addMutation;
      const responseFieldName = id
        ? 'automationsAiAgentEdit'
        : 'automationsAiAgentAdd';

      const res = await mutation({
        variables: id ? { ...input, id } : input,
        refetchQueries: [
          AUTOMATIONS_AI_AGENT_TOTAL_COUNTS,
          ...(id
            ? [
                {
                  query: AUTOMATIONS_AI_AGENT_DETAIL,
                  variables: { id },
                },
                {
                  query: AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES,
                  variables: { agentId: id },
                },
              ]
            : []),
        ],
        onError: ({ message }) => {
          toast({
            title: 'Something went wrong',
            description: message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: `Succefully ${id ? 'edited' : 'added'}`,
            variant: 'success',
          });
        },
      });

      const savedAgent = res?.data?.[responseFieldName];

      // After a create, switch to the new agent's edit route so the form
      // binds to the saved record instead of staying on the blank create page.
      if (!id && savedAgent?._id) {
        navigate(
          `${AutomationSettingsPath.Agents}/${savedAgent._id}${search}`,
          { replace: true },
        );
      }

      return savedAgent;
    },
    [addMutation, editMutation, id, navigate, search],
  );

  return {
    detail,
    loading,
    saving: adding || editing,
    handleSave,
  };
}

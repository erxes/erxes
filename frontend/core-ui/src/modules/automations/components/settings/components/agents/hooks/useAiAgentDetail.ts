import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  AUTOMATIONS_AI_AGENT_ADD,
  AUTOMATIONS_AI_AGENT_DETAIL,
  AUTOMATIONS_AI_AGENT_EDIT,
  AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES,
  AUTOMATIONS_AI_AGENT_MODELS,
  AUTOMATIONS_AI_AGENTS,
} from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

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
  usage?: {
    total: number;
    active: number;
    automations: Array<{ _id: string; name: string; status: string }>;
  };
}

export function useAiAgentDetail({
  id,
  skip = false,
  onCreated,
}: {
  id?: string;
  skip?: boolean;
  onCreated: (agentId: string) => void;
}) {
  const { t } = useTranslation('automations');

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
          AUTOMATIONS_AI_AGENTS,
          // A new key or base url can change which models the provider lists.
          AUTOMATIONS_AI_AGENT_MODELS,
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
            title: t('sidebar-something-went-wrong'),
            description: message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: id
              ? t('settings-agent-saved-edited')
              : t('settings-agent-saved-added'),
            variant: 'success',
          });
        },
      });

      const savedAgent = res?.data?.[responseFieldName];

      // After a create, the host rebinds to the saved record so the form
      // stops being a blank create form.
      if (!id && savedAgent?._id) {
        onCreated(savedAgent._id);
      }

      return savedAgent;
    },
    [addMutation, editMutation, id, onCreated, t],
  );

  return {
    detail,
    loading,
    saving: adding || editing,
    handleSave,
  };
}

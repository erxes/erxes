import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  AUTOMATIONS_AI_AGENT_ADD,
  AUTOMATIONS_AI_AGENT_EDIT,
  AUTOMATIONS_AI_AGENT_DETAIL,
} from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { toast } from 'erxes-ui';
import { useParams } from 'react-router';

export interface AiAgentInput {
  name?: string;
  description?: string;
  provider?: string;
  prompt?: string;
  instructions?: string;
  files?: unknown;
  config?: unknown;
}

export function useAiAgentDetail() {
  const { id } = useParams();

  const { data, loading } = useQuery(AUTOMATIONS_AI_AGENT_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const [addMutation, { loading: adding }] = useMutation(
    AUTOMATIONS_AI_AGENT_ADD,
  );
  const [editMutation, { loading: editing }] = useMutation(
    AUTOMATIONS_AI_AGENT_EDIT,
  );

  const detail = useMemo(() => data?.automationsAiAgentDetail, [data]);

  const handleSave = async (input: AiAgentInput) => {
    const mutation = id ? editMutation : addMutation;

    const responseFieldName = id
      ? 'automationsAiAgentEdit'
      : 'automationsAiAgentAdd';

    const res = await mutation({
      variables: id ? { ...input, id } : input,
      onError: ({ message }) => {
        toast({ title: 'Something went wrong', description: message });
      },
      onCompleted: () => {
        toast({ title: `Succefully ${id ? 'edited' : 'added'}` });
      },
    });
    return (res?.data || {})[responseFieldName];
  };

  return {
    detail,
    loading,
    saving: adding || editing,
    handleSave,
  };
}

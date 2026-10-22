import {
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { AUTOMATIONS_AI_AGENT_MODELS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentModelsResponse } from '@/automations/components/settings/components/agents/hooks/useAiAgentModelOptions';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

// A new agent still on the built-in default moves to the server's pick, so a
// retired default never reaches a new agent. Explicit picks are untouched.
// Lives at the detail level because the model step may never be opened.
export const useAiAgentDefaultModel = (isNew: boolean) => {
  const { watch, setValue } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider') as TAiAgentProvider;
  const value = watch('connection.model');

  // Same variables as the model picker, so both share one cached request.
  const { data } = useQuery<TAiAgentModelsResponse>(
    AUTOMATIONS_AI_AGENT_MODELS,
    {
      variables: { provider },
      skip: !isNew || !provider,
      fetchPolicy: 'cache-and-network',
    },
  );

  const defaultModel = data?.automationsAiAgentModels?.find(
    ({ isDefault }) => isDefault,
  )?.id;

  useEffect(() => {
    if (
      isNew &&
      defaultModel &&
      value === AI_AGENT_PROVIDER_DEFAULT_MODELS[provider] &&
      defaultModel !== value
    ) {
      setValue('connection.model', defaultModel, { shouldDirty: true });
    }
  }, [defaultModel, isNew, provider, setValue, value]);
};

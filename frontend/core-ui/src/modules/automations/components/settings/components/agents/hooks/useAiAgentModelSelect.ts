import { TAiAgentProvider } from '@/automations/components/settings/components/agents/constants/providers';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { useAiAgentModelOptions } from '@/automations/components/settings/components/agents/hooks/useAiAgentModelOptions';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * The model picker for the chosen provider. The agent's saved model counts
 * only while the provider is still the one it was saved with.
 */
export const useAiAgentModelSelect = () => {
  const { control, watch } = useFormContext<TAiAgentForm>();
  const { detail } = useAiAgentDetailContext();
  const provider = watch('connection.provider') as TAiAgentProvider;
  const value = watch('connection.model');
  const options = useAiAgentModelOptions({
    agentId: detail?._id,
    provider,
    savedModel:
      detail?.connection?.provider === provider
        ? detail.connection.model
        : undefined,
    value,
  });
  const { setOpen } = options;

  // Picking a model closes the list
  const selectModel = useCallback(
    (onChange: (model: string) => void) => (model: string) => {
      onChange(model);
      setOpen(false);
    },
    [setOpen],
  );

  return { control, ...options, selectModel };
};

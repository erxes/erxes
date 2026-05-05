import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const MODELS = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4o-mini',
];

export const useAiAgentConnectionForm = () => {
  const { control, watch, setValue } = useFormContext<TAiAgentForm>();
  const [isReplacingApiKey, setIsReplacingApiKey] = useState(false);

  const currentModel = watch('connection.model');

  const modelOptions = useMemo(() => {
    if (currentModel && !MODELS.includes(currentModel)) {
      return [currentModel, ...MODELS];
    }
    return MODELS;
  }, [currentModel]);

  return {
    control,
    setValue,
    modelOptions,
    isReplacingApiKey,
    setIsReplacingApiKey,
  };
};

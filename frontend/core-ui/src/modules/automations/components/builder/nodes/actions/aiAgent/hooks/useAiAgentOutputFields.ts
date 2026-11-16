import { TAiAgentOutputTab } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentConfigTabs';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

/** The run's goal, and how many fields and tools generated text carries. */
export const useAiAgentOutputFields = (
  onOutputTabChange: (tab: TAiAgentOutputTab) => void,
) => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  const [goalType, captureFields, tools] = useWatch({
    control,
    name: ['goalType', 'captureFields', 'tools'],
  });

  const onTabChange = useCallback(
    (value: string) => onOutputTabChange(value as TAiAgentOutputTab),
    [onOutputTabChange],
  );

  return {
    goalType,
    captureCount: (captureFields || []).length,
    toolCount: (tools || []).length,
    onTabChange,
  };
};

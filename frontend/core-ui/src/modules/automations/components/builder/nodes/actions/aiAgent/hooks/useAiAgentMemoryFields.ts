import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { ChangeEvent, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

// Minutes a saved memory lives when nothing else is chosen: one day
export const AI_AGENT_MEMORY_DEFAULT_TTL = 1440;

/** Whether the agent reads and saves memory, which opens their settings. */
export const useAiAgentMemoryFields = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  const [readEnabled, writeEnabled] = useWatch({
    control,
    name: ['memory.read.enabled', 'memory.write.enabled'],
  });

  const asNumber = useCallback(
    (onChange: (value: number) => void) =>
      (event: ChangeEvent<HTMLInputElement>) =>
        onChange(Number(event.target.value)),
    [],
  );

  return { control, readEnabled, writeEnabled, asNumber };
};

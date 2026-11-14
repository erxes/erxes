import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { ChangeEvent, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAiAgentRuntimePresets } from './useAiAgentRuntimePresets';

export const AI_AGENT_RUNTIME_DEFAULTS = {
  temperature: 0,
  maxTokens: 2000,
  timeoutMs: 15000,
};

// An emptied number input means zero, not "not a number"
const toNumber = (value: string) => (value === '' ? 0 : Number(value));

const formatSeconds = (ms: number) => `${Math.round(ms / 1000)}s`;

/** The run limits in force, with defaults where none were set. */
export const useAiAgentRuntimeForm = () => {
  const { control } = useFormContext<TAiAgentForm>();
  const runtime = useWatch({ control, name: 'runtime' });
  const temperature =
    runtime?.temperature ?? AI_AGENT_RUNTIME_DEFAULTS.temperature;
  const maxTokens = runtime?.maxTokens ?? AI_AGENT_RUNTIME_DEFAULTS.maxTokens;
  const timeoutMs = runtime?.timeoutMs ?? AI_AGENT_RUNTIME_DEFAULTS.timeoutMs;

  const asNumber = useCallback(
    (onChange: (value: number) => void) =>
      (event: ChangeEvent<HTMLInputElement>) =>
        onChange(toNumber(event.target.value)),
    [],
  );

  return {
    control,
    appliedValues: {
      temperature,
      maxTokens: maxTokens.toLocaleString(),
      seconds: Math.round(timeoutMs / 1000),
    },
    asNumber,
  };
};

/** The budget presets, the one in force, and applying one. */
export const useAiAgentRuntimePresetOptions = () => {
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const runtime = useWatch({ control, name: 'runtime' });
  const { presets, activePreset, loading } = useAiAgentRuntimePresets(runtime);

  const presetOptions = presets.map((preset) => ({
    preset,
    isActive: activePreset?.key === preset.key,
    limitsLabel: `${preset.runtime.maxTokens.toLocaleString()} tokens · ${formatSeconds(
      preset.runtime.timeoutMs,
    )} timeout`,
    apply: () =>
      setValue('runtime', preset.runtime, {
        shouldDirty: true,
        shouldValidate: true,
      }),
  }));

  return { loading, isCustom: !activePreset, presetOptions };
};

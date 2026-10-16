import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { useQuery } from '@apollo/client';

export type TAiAgentRuntime = {
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
};

export type TAiAgentRuntimePreset = {
  key: string;
  label: string;
  description: string;
  runtime: TAiAgentRuntime;
};

type TAutomationConstantsResponse = {
  automationConstants?: {
    aiAgentRuntimePresetsConst?: TAiAgentRuntimePreset[];
  };
};

const isSameRuntime = (a: TAiAgentRuntime, b?: Partial<TAiAgentRuntime>) =>
  a.temperature === b?.temperature &&
  a.maxTokens === b?.maxTokens &&
  a.timeoutMs === b?.timeoutMs;

/**
 * Runtime presets come from the service so budgets follow its limits. The
 * active one is matched by value; anything else is a custom setup.
 */
export const useAiAgentRuntimePresets = (
  runtime?: Partial<TAiAgentRuntime>,
) => {
  const { data, loading } =
    useQuery<TAutomationConstantsResponse>(AUTOMATION_CONSTANTS);
  const presets = data?.automationConstants?.aiAgentRuntimePresetsConst || [];
  const activePreset = presets.find((preset) =>
    isSameRuntime(preset.runtime, runtime),
  );

  return { presets, activePreset, loading };
};

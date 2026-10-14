export const AUTOMATION_APPROVAL_CONTENT_TYPES = {
  AUTOMATION: 'core:automation',
  AUTOMATION_AI_AGENT: 'core:automation_ai_agent',
} as const;

export type TAiAgentRuntimePreset = {
  key: string;
  label: string;
  description: string;
  runtime: { temperature: number; maxTokens: number; timeoutMs: number };
};

// Budgets track the automations service limits: fast equals AI_AGENT_DEFAULTS,
// balanced clears AI_AGENT_TOOL_LOOP_MIN_MAX_TOKENS, thorough hits maxTimeoutMs.
export const AI_AGENT_RUNTIME_PRESETS: TAiAgentRuntimePreset[] = [
  {
    key: 'fast',
    label: 'Fast',
    description: 'Short replies with a quick timeout.',
    runtime: { temperature: 0.2, maxTokens: 2000, timeoutMs: 15000 },
  },
  {
    key: 'balanced',
    label: 'Balanced',
    description: 'Headroom for knowledge search and tool calls.',
    runtime: { temperature: 0.2, maxTokens: 4000, timeoutMs: 20000 },
  },
  {
    key: 'thorough',
    label: 'Thorough',
    description: 'Reasoning models and long context.',
    runtime: { temperature: 0.2, maxTokens: 8000, timeoutMs: 30000 },
  },
];

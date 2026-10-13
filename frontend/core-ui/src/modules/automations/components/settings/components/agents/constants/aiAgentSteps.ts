import {
  IconAntenna,
  IconBooks,
  IconCpu,
  IconHeartbeat,
  IconId,
} from '@tabler/icons-react';

export const AI_AGENT_STEPS = [
  'identity',
  'connection',
  'brain',
  'memory',
  'test',
] as const;

export type TAiAgentStep = (typeof AI_AGENT_STEPS)[number];

export type TAiAgentStepStatus =
  | 'done'
  | 'hint'
  | 'warning'
  | 'error'
  | 'missing'
  | 'pending';

export type TAiAgentStepState = {
  status: TAiAgentStepStatus;
  // Short, in the bot's voice; `detail` says how to fix it.
  message?: string;
  detail?: string;
};

export const AI_AGENT_INSTRUCTIONS_KEY = 'instructions';

// Old links still carry the four-tab names.
export const AI_AGENT_LEGACY_TABS: Record<string, TAiAgentStep> = {
  general: 'identity',
  context: 'memory',
  health: 'test',
};

export const AI_AGENT_STEP_META: Record<
  TAiAgentStep,
  { label: string; icon: typeof IconId }
> = {
  identity: { label: 'Identity', icon: IconId },
  connection: { label: 'Connection', icon: IconAntenna },
  brain: { label: 'Brain', icon: IconCpu },
  memory: { label: 'Memory', icon: IconBooks },
  test: { label: 'Test run', icon: IconHeartbeat },
};

export const AI_AGENT_STATUS_SEVERITY: Record<TAiAgentStepStatus, number> = {
  error: 5,
  warning: 4,
  missing: 3,
  hint: 2,
  pending: 1,
  done: 0,
};

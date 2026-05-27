import { IconRobot } from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type TAiAgentKind = {
  type: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export const AI_AGENT_KINDS: TAiAgentKind[] = [
  {
    type: 'openai-compatible',
    label: 'OpenAI Compatible',
    description:
      'Connect OpenAI or any compatible provider with your own credentials.',
    icon: IconRobot,
  },
];

export const getAiAgentKind = (type?: string | null) => {
  return AI_AGENT_KINDS.find((kind) => kind.type === type) || AI_AGENT_KINDS[0];
};

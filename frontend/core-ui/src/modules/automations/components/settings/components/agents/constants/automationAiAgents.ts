import { IconRobot } from '@tabler/icons-react';
import type { ComponentType } from 'react';

export type TAiAgentKind = {
  type: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
};

export const AI_AGENT_KINDS: TAiAgentKind[] = [
  {
    type: 'openai',
    label: 'OpenAI',
    description: 'Connect OpenAI  with your own credentials.',
    icon: IconRobot,
    image: 'openai.webp',
  },
];

export const getAiAgentKind = (type?: string | null) => {
  return AI_AGENT_KINDS.find((kind) => kind.type === type) || AI_AGENT_KINDS[0];
};

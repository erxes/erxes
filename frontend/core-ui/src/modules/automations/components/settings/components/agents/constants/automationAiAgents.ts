import { IconCloud, IconRobot } from '@tabler/icons-react';
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
    type: 'cloudflare-ai-gateway',
    label: 'Cloudflare AI Gateway',
    description: 'Use the platform-managed AI Gateway or override it.',
    icon: IconCloud,
    image: 'cloudflare.webp',
  },
  {
    type: 'openai',
    label: 'OpenAI Direct',
    description: 'Connect OpenAI with organization-owned credentials.',
    icon: IconRobot,
    image: 'openai.webp',
  },
];

export const getAiAgentKind = (type?: string | null) => {
  return AI_AGENT_KINDS.find((kind) => kind.type === type) || AI_AGENT_KINDS[0];
};

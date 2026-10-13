import { getAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { cn } from 'erxes-ui';

export const AiAgentProviderLogo = ({
  provider,
  className,
}: {
  provider?: string | null;
  className?: string;
}) => (
  <img
    src={`/assets/${getAiAgentKind(provider).image || 'erxes-bot.webp'}`}
    alt=""
    className={cn('size-4 shrink-0', className)}
  />
);

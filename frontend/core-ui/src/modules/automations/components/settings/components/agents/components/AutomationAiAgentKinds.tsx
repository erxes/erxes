import { AUTOMATIONS_AI_AGENT_TOTAL_COUNTS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface AutomationAiAgentKindRowProps {
  kind: TAiAgentKind;
  className?: string;
  totalCount?: number;
}

const AutomationAiAgentKindRow = ({
  kind,
  className = '',
  totalCount = 0,
}: AutomationAiAgentKindRowProps) => {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
        <img
          src={kind.image ? `/assets/${kind.image}` : '/assets/erxes-bot.webp'}
          alt={kind.label}
          className="size-5"
        />
      </div>
      <div className="min-w-0">
        <h6 className="truncate text-sm font-medium text-start">
          {kind.label} ({totalCount})
        </h6>
        <p className="truncate text-xs leading-4 text-muted-foreground">
          {kind.description}
        </p>
      </div>
    </div>
  );
};

interface AutomationAiAgentKindsGridProps {
  kinds: TAiAgentKind[];
  selectedKind: string | null;
  onKindSelect: (value: string | null) => void;
}

export const AutomationAiAgentKinds = ({
  kinds,
  selectedKind,
  onKindSelect,
}: AutomationAiAgentKindsGridProps) => {
  const { t } = useTranslation('automations');
  const { data } = useQuery<{
    automationsAiAgentTotalCounts: Record<string, number>;
  }>(AUTOMATIONS_AI_AGENT_TOTAL_COUNTS);
  const selectedAiKind =
    kinds.find((kind) => kind.type === selectedKind) || kinds[0];
  const totalCounts = data?.automationsAiAgentTotalCounts || {};

  if (!selectedAiKind) {
    return null;
  }

  return (
    <Select value={selectedAiKind.type} onValueChange={onKindSelect}>
      <Select.Trigger className="h-16 w-80 max-w-full rounded-lg border bg-background px-3 shadow-none focus:shadow-focus [&>span]:min-w-0 [&>svg]:shrink-0">
        <AutomationAiAgentKindRow
          kind={selectedAiKind}
          className="w-full"
          totalCount={totalCounts[selectedAiKind.type] || 0}
        />
      </Select.Trigger>
      <Select.Content className="w-80">
        <Select.Group>
          <Select.Label className="px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">
            {t('select-provider')}
          </Select.Label>
          {kinds.map((kind) => (
            <Select.Item
              key={kind.type}
              value={kind.type}
              className="h-16 rounded-md py-2 data-[state=checked]:bg-primary/10 [&>span:first-child]:hidden [&>span:last-child]:min-w-0 [&>span:last-child]:overflow-hidden"
            >
              <AutomationAiAgentKindRow
                kind={kind}
                className="w-64"
                totalCount={totalCounts[kind.type] || 0}
              />
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};

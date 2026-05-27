import { TAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { Card, cn } from 'erxes-ui';

interface AutomationAiAgentKindCardProps {
  kind: TAiAgentKind;
  isSelected: boolean;
  onClick: () => void;
}

const AutomationAiAgentKindCard = ({
  kind,
  isSelected,
  onClick,
}: AutomationAiAgentKindCardProps) => {
  const Icon = kind.icon;

  return (
    <Card
      className={cn('cursor-pointer p-3 transition-colors', {
        'ring-2 ring-primary bg-primary/5': isSelected,
        'hover:bg-muted/50': !isSelected,
      })}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h6 className="text-sm font-medium">{kind.label}</h6>
          <p className="text-xs text-muted-foreground">{kind.description}</p>
        </div>
      </div>
    </Card>
  );
};

interface AutomationAiAgentKindsGridProps {
  kinds: TAiAgentKind[];
  selectedKind: string | null;
  onKindSelect: (value: string | null) => void;
}

export const AutomationAiAgentKindsGrid = ({
  kinds,
  selectedKind,
  onKindSelect,
}: AutomationAiAgentKindsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {kinds.map((kind) => (
        <AutomationAiAgentKindCard
          key={kind.type}
          kind={kind}
          isSelected={selectedKind === kind.type}
          onClick={() =>
            onKindSelect(selectedKind === kind.type ? null : kind.type)
          }
        />
      ))}
    </div>
  );
};

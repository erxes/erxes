import { Card, cn } from 'erxes-ui';

// Individual AI Agent Kind Card Component
interface AutomationAiAgentKindCardProps {
  type: string;
  img: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const AutomationAiAgentKindCard = ({
  type,
  img,
  label,
  isSelected,
  onClick,
}: AutomationAiAgentKindCardProps) => {
  return (
    <Card
      className={cn('p-3 cursor-pointer transition-colors', {
        'ring-2 ring-primary bg-primary/5': isSelected,
        'hover:bg-muted/50': !isSelected,
      })}
      onClick={onClick}
    >
      <div className="flex gap-3 items-center">
        <div className="size-8 rounded-lg overflow-hidden bg-background border">
          <img
            src={img}
            alt={type}
            className="w-full h-full object-contain p-1"
          />
        </div>
        <h6 className="font-medium text-sm">{label}</h6>
      </div>
    </Card>
  );
};

// AI Agent Kinds Grid Component
interface AutomationAiAgentKindsGridProps {
  kinds: Array<{ type: string; img: string; label: string }>;
  selectedKind: string | null;
  onKindSelect: (value: string | null) => void;
}

export const AutomationAiAgentKindsGrid = ({
  kinds,
  selectedKind,
  onKindSelect,
}: AutomationAiAgentKindsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {kinds.map(({ type, img, label }) => (
        <AutomationAiAgentKindCard
          key={type}
          type={type}
          img={img}
          label={label}
          isSelected={selectedKind === type}
          onClick={() => onKindSelect(selectedKind === type ? null : type)}
        />
      ))}
    </div>
  );
};

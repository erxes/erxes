import { TAiAgentKnowledgeSourceRailItem } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceRail';
import { cn } from 'erxes-ui';

export const AiAgentKnowledgeSourceRail = ({
  items,
  activeKey,
  onSelect,
}: {
  items: TAiAgentKnowledgeSourceRailItem[];
  activeKey?: string;
  onSelect: (key: string) => void;
}) => {
  return (
    <nav className="w-52 shrink-0 space-y-1 border-r pr-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">
              {item.label}
            </span>
            <span className="text-xs text-muted-foreground">{item.count}</span>
          </button>
        );
      })}
    </nav>
  );
};

import { cn, IconComponent } from 'erxes-ui';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';
import { AutomationNodeType } from '@/automations/types';

export const AutomationVariableSourceNodeCard = ({
  node,
  isSelected,
  onClick,
}: {
  node: TAutomationVariableSourceNode;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'bg-background hover:border-primary/50',
      )}
    >
      {node.icon ? (
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <IconComponent className="size-4" name={node.icon} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{node.label}</div>
        <div className="text-xs text-muted-foreground">
          {node.nodeType === AutomationNodeType.Trigger ? 'Trigger' : 'Action'}
        </div>
      </div>
    </button>
  );
};

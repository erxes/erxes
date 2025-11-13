import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { AutomationNodeType } from '@/automations/types';
import { memo } from 'react';
import { IAutomationsActionFolkConfig } from 'ui-modules';

const AUTOMATION_FOLK_VARIABLES = {
  default: {
    className: '!bg-muted-foreground',
    addButtonClassName:
      'hover:text-muted-foreground hover:border-muted-foreground',
  },
  success: {
    className: '!bg-success',
    addButtonClassName: 'hover:text-success hover:border-success',
  },
  error: {
    className: '!bg-destructive',
    addButtonClassName: 'hover:text-destructive hover:border-destructive',
  },
};

type ActionSourceHandlerFolksProps = {
  nodeId: string;
  config: any;
  folks: IAutomationsActionFolkConfig[];
};

export const FolksActionSourceHandler = memo(
  ({ nodeId, config = {}, folks }: ActionSourceHandlerFolksProps) => {
    const total = folks.length;
    const step = total > 1 ? 30 / (total - 1) : 0; // distribute 50%..80%

    return (
      <>
        {folks.map(({ key, label, type }, index) => {
          const { className, addButtonClassName } =
            AUTOMATION_FOLK_VARIABLES[type] ||
            AUTOMATION_FOLK_VARIABLES.default;

          const topPercent = 50 + index * step; // 1 => 50%; 2 => 50,80; n => 50..80
          const displayLabel =
            label && label.length > 5 ? label.slice(0, 5) : label;

          const id = `${key}-right`;

          return (
            <NodeOutputHandler
              key={id}
              id={id}
              handlerId={`${nodeId}__${key}`}
              className={className}
              addButtonClassName={addButtonClassName}
              style={{ top: `${topPercent}%` }}
              showAddButton={!config[key]}
              nodeType={AutomationNodeType.Action}
            >
              <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
                {displayLabel}
              </div>
            </NodeOutputHandler>
          );
        })}
      </>
    );
  },
);

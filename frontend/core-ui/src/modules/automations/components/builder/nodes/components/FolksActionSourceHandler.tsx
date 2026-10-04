import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
import { AutomationNodeType } from '@/automations/types';
import { memo } from 'react';
import { IAutomationsActionFolkConfig } from 'ui-modules';

const AUTOMATION_FOLK_VARIABLES = {
  default: {
    className: '!border-muted-foreground',
    addButtonClassName:
      'hover:text-muted-foreground hover:border-muted-foreground',
  },
  success: {
    className: '!border-success',
    addButtonClassName: 'hover:text-success hover:border-success',
  },
  error: {
    className: '!border-destructive',
    addButtonClassName: 'hover:text-destructive hover:border-destructive',
  },
};

type ActionSourceHandlerFolksProps = {
  nodeId: string;
  config: any;
  folks: IAutomationsActionFolkConfig[];
  flowDirection?: TAutomationFlowDirection;
  nodeType?: AutomationNodeType;
};

export const FolksActionSourceHandler = memo(
  ({
    nodeId,
    config = {},
    folks,
    flowDirection = 'horizontal',
    nodeType = AutomationNodeType.Action,
  }: ActionSourceHandlerFolksProps) => {
    const isVertical = flowDirection === 'vertical';
    const total = folks.length;

    return (
      <>
        {folks.map(({ key, label, type }, index) => {
          const { className, addButtonClassName } =
            AUTOMATION_FOLK_VARIABLES[type] ||
            AUTOMATION_FOLK_VARIABLES.default;

          // Distribute handles evenly: (i+1)/(n+1)*100 gives balanced margins on both sides
          // e.g. 1 folk → 50%; 2 folks → 33%, 67%; 3 folks → 25%, 50%, 75%
          const positionPercent = ((index + 1) / (total + 1)) * 100;
          const displayLabel =
            label && label.length > 5 ? label.slice(0, 5) : label;

          const id = `${key}-right`;
          const handleId = `${nodeId}__${key}`;

          return (
            <NodeOutputHandler
              key={id}
              id={id}
              handlerId={handleId}
              className={className}
              addButtonClassName={addButtonClassName}
              style={
                isVertical
                  ? { left: `${positionPercent}%` }
                  : { top: `${positionPercent}%` }
              }
              showAddButton={!config[key]}
              nodeType={nodeType}
              flowDirection={flowDirection}
              label={displayLabel}
            />
          );
        })}
      </>
    );
  },
);

FolksActionSourceHandler.displayName = 'FolksActionSourceHandler';

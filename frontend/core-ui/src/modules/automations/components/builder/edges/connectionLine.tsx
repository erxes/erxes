import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType, NodeData } from '@/automations/types';
import {
  ConnectionLineComponentProps,
  InternalNode,
  Handle,
  Node,
} from '@xyflow/react';
import { cn } from 'erxes-ui';
import { IAutomationsActionFolkConfig } from 'ui-modules/modules/automations/types';

const getFolkTypeFn = (
  actionFolks: Record<string, IAutomationsActionFolkConfig[]>,
  fromHandle: Handle,
  fromNode: InternalNode<Node>,
) => {
  fromNode.data.type;
  const folks =
    fromNode?.type === AutomationNodeType.Action
      ? actionFolks[fromNode.data.type as string]
      : null;

  const folkType = folks
    ? (folks || [])?.find((folk) =>
        fromHandle.id?.includes(`${folk.key}-right`),
      )?.type
    : undefined;
  return folkType;
};

const ConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  ...props
}: ConnectionLineComponentProps) => {
  const { fromHandle, fromNode } = props;
  const { actionFolks } = useAutomation();

  const folkType = getFolkTypeFn(actionFolks, fromHandle, fromNode);

  return (
    <g>
      <path
        fill="none"
        className={cn({
          'stroke-success': fromNode.type === AutomationNodeType.Action,
          'stroke-primary': fromNode.type === AutomationNodeType.Trigger,
          'stroke-destructive': folkType === 'error',
          'stroke-info': folkType === 'default',
        })}
        strokeWidth={2}
        d={`M${fromX},${fromY} C${fromX + 50},${fromY} ${
          toX - 50
        },${toY} ${toX},${toY}`}
      />

      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={10}
        className={cn('fill-white stroke-success stroke-2', {
          'stroke-destructive': folkType === 'error',
        })}
        strokeWidth={4}
      />
    </g>
  );
};

export default ConnectionLine;

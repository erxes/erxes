import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import {
  ConnectionLineComponentProps,
  InternalNode,
  Handle,
  Node,
} from '@xyflow/react';
import { cn } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { IAutomationsActionFolkConfig } from 'ui-modules';

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
  const flowDirection =
    useWatch<TAutomationBuilderForm, 'flowDirection'>({
      name: 'flowDirection',
    }) || 'horizontal';

  const folkType = getFolkTypeFn(actionFolks, fromHandle, fromNode);
  const edgePath =
    flowDirection === 'vertical'
      ? `M${fromX},${fromY} C${fromX},${fromY + 50} ${toX},${
          toY - 50
        } ${toX},${toY}`
      : `M${fromX},${fromY} C${fromX + 50},${fromY} ${
          toX - 50
        },${toY} ${toX},${toY}`;

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
        d={edgePath}
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

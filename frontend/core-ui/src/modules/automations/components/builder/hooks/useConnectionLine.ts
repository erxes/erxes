import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import {
  ConnectionLineComponentProps,
  Handle,
  InternalNode,
  Node,
} from '@xyflow/react';
import { useWatch } from 'react-hook-form';
import { IAutomationsActionFolkConfig } from 'ui-modules';

// How far the curve leaves each end along the flow before bending
const CURVE_HANDLE_LENGTH = 50;

/** The branch kind (default or error) of the action handle being dragged. */
const folkTypeOf = (
  actionFolks: Record<string, IAutomationsActionFolkConfig[]>,
  fromHandle: Handle,
  fromNode: InternalNode<Node>,
) => {
  if (fromNode?.type !== AutomationNodeType.Action) {
    return undefined;
  }

  return (actionFolks[fromNode.data.type as string] || []).find((folk) =>
    fromHandle.id?.includes(`${folk.key}-right`),
  )?.type;
};

const connectionPathOf = (
  isVertical: boolean,
  {
    fromX,
    fromY,
    toX,
    toY,
  }: Pick<ConnectionLineComponentProps, 'fromX' | 'fromY' | 'toX' | 'toY'>,
) =>
  isVertical
    ? `M${fromX},${fromY} C${fromX},${fromY + CURVE_HANDLE_LENGTH} ${toX},${
        toY - CURVE_HANDLE_LENGTH
      } ${toX},${toY}`
    : `M${fromX},${fromY} C${fromX + CURVE_HANDLE_LENGTH},${fromY} ${
        toX - CURVE_HANDLE_LENGTH
      },${toY} ${toX},${toY}`;

/** The line drawn while dragging a new connection, coloured by its source. */
export const useConnectionLine = (props: ConnectionLineComponentProps) => {
  const { fromHandle, fromNode } = props;
  const { actionFolks } = useAutomation();
  const flowDirection =
    useWatch<TAutomationBuilderForm, 'flowDirection'>({
      name: 'flowDirection',
    }) || 'horizontal';
  const folkType = folkTypeOf(actionFolks, fromHandle, fromNode);

  return {
    edgePath: connectionPathOf(flowDirection === 'vertical', props),
    isFromAction: fromNode.type === AutomationNodeType.Action,
    isFromTrigger: fromNode.type === AutomationNodeType.Trigger,
    isErrorBranch: folkType === 'error',
    isDefaultBranch: folkType === 'default',
  };
};

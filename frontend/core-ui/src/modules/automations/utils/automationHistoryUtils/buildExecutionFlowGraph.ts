import { AutomationNodeType, NodeData } from '@/automations/types';
import { Edge, Node } from '@xyflow/react';
import {
  IAutomationHistory,
  IAutomationHistoryAction,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

const NODE_GAP_X = 420;

type BuildArgs = {
  execution?: IAutomationHistory;
  triggersConst: IAutomationsTriggerConfigConstants[];
  actionsConst: IAutomationsActionConfigConstants[];
};

const buildTriggerNode = (
  execution: IAutomationHistory,
  triggersConst: IAutomationsTriggerConfigConstants[],
): Node<NodeData> => {
  const constant = triggersConst.find(
    ({ type }) => type === execution.triggerType,
  );

  return {
    id: execution.triggerId,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: {
      id: execution.triggerId,
      nodeIndex: 0,
      nodeType: AutomationNodeType.Trigger,
      type: execution.triggerType,
      label: constant?.label || execution.triggerType || 'Trigger',
      description: constant?.description,
      icon: constant?.icon,
      config: execution.triggerConfig,
      isCustom: constant?.isCustom,
      flowDirection: 'horizontal',
      readOnly: true,
    },
  };
};

const buildActionNode = (
  action: IAutomationHistoryAction,
  index: number,
  actionsConst: IAutomationsActionConfigConstants[],
): Node<NodeData> => {
  const constant = actionsConst.find(({ type }) => type === action.actionType);
  const id = action.actionId || `${action.actionType}-${index}`;

  return {
    id,
    type: 'action',
    position: { x: (index + 1) * NODE_GAP_X, y: 0 },
    data: {
      id,
      nodeIndex: index,
      nodeType: AutomationNodeType.Action,
      type: action.actionType,
      label: constant?.label || action.actionType || 'Action',
      description: constant?.description,
      icon: constant?.icon,
      config: action.actionConfig,
      flowDirection: 'horizontal',
      readOnly: true,
      // The node config components read the action, not the form, in this mode
      actionSnapshot: {
        id,
        type: action.actionType,
        config: action.actionConfig,
        nextActionId: action.nextActionId,
      } as NodeData['actionSnapshot'],
    },
  };
};

/**
 * Builds the flow from the execution itself, so it shows the path that really
 * ran with the values it ran with — the automation's current definition may
 * have changed since. Steps that were never reached were never recorded, so
 * they are absent by design.
 */
export const buildExecutionFlowGraph = ({
  execution,
  triggersConst,
  actionsConst,
}: BuildArgs): { nodes: Node<NodeData>[]; edges: Edge[] } => {
  if (!execution) {
    return { nodes: [], edges: [] };
  }

  const nodes = [
    buildTriggerNode(execution, triggersConst),
    ...(execution.actions || []).map((action, index) =>
      buildActionNode(action, index, actionsConst),
    ),
  ];

  const edges: Edge[] = nodes.slice(1).map((node, index) => ({
    id: `${nodes[index].id}->${node.id}`,
    source: nodes[index].id,
    target: node.id,
    type: 'smoothstep',
  }));

  return { nodes, edges };
};

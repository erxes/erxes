import { AutomationNodeType, NodeData } from '@/automations/types';
import { generateNodePosition } from '@/automations/utils/automationBuilderUtils/nodePosition';
import { TAutomationNodeState } from '@/automations/utils/automationFormDefinitions';
import { Node } from '@xyflow/react';
import {
  TAutomationAction,
  TAutomationTrigger,
  TAutomationWorkflowNode,
} from 'ui-modules';

export const generateNodeData = (
  node: TAutomationNodeState,
  nodeType:
    | AutomationNodeType.Action
    | AutomationNodeType.Trigger
    | AutomationNodeType.Workflow,
  props: any,
) => {
  if (nodeType === AutomationNodeType.Workflow) {
    const { name, description, config, automationId } = node as Extract<
      TAutomationNodeState,
      { nodeType: AutomationNodeType.Workflow }
    >;
    return {
      label: name,
      description,
      config,
      nodeType: AutomationNodeType.Workflow,
      automationId,
    };
  }

  if (nodeType === AutomationNodeType.Action) {
    const {
      label,
      description,
      icon,
      config,
      isCustom,
      nextActionId,
      type,
      workflowId,
    } = node as Extract<
      TAutomationNodeState,
      { nodeType: AutomationNodeType.Action }
    >;
    return {
      label,
      description,
      icon,
      nodeType: AutomationNodeType.Action,
      type: type,
      config,
      isCustom,
      nextActionId,
      workflowId,
      ...props,
    };
  }

  const { label, description, icon, config, isCustom, actionId, type } =
    node as Extract<
      TAutomationNodeState,
      { nodeType: AutomationNodeType.Trigger }
    >;
  return {
    label,
    description,
    icon,
    nodeType: AutomationNodeType.Trigger,
    type,
    config,
    isCustom,
    actionId,
    ...props,
  };
};

/**
 * Generates a React Flow node object from a given action or trigger node,
 * adding position, styles, and additional data needed for rendering and interaction.
 *
 * @param node - The action or trigger node data, containing fields like id, label, config, etc.
 * @param nodeType - A string representing the type of the node ('action', 'trigger', etc.).
 * @param nodes - The list of sibling nodes used for calculating node position.
 * @param props - Additional properties to merge into the node's data (e.g., UI context, indexes).
 * @param generatedNodes - Array of already generated nodes, useful for position calculation and layout.
 * @param parentId - Optional ID of the parent node, for nesting and grouping this node under a parent.
 *
 * @returns A React Flow `Node<NodeData>` object configured with position, data, style, and interaction properties.
 */

export const generateNode = (
  node: TAutomationNodeState,
  nodeType:
    | AutomationNodeType.Action
    | AutomationNodeType.Trigger
    | AutomationNodeType.Workflow,
  nodes: TAutomationAction[] | TAutomationTrigger[] | TAutomationWorkflowNode[],
  props: any,
  generatedNodes: Node<NodeData>[],
) => {
  const doc: any = {
    id: node.id,
    data: generateNodeData(node, nodeType, props),
    position: generateNodePosition(nodes, node, generatedNodes),
    isConnectable: true,
    type: nodeType,
    style: {
      zIndex: -1,
    },
  };

  return doc;
};

/**
 * Generates React Flow nodes for triggers, actions, and optionally nested workflow actions.
 *
 * - Returns a default "scratch" node if no triggers or actions exist.
 * - Generates nodes for triggers and actions with additional props.
 * - Recursively generates nodes for nested workflows if provided.
 *
 * @param params - Object containing lists of actions, triggers, and optionally workflow actions.
 * @param params.actions - Array of action nodes.
 * @param params.triggers - Array of trigger nodes.
 * @param params.workFlowActions - Optional array of workflow objects, each containing a workflowId and associated actions.
 * @param props - Additional props passed to each generated node, can include UI or contextual data.
 *
 * @returns An array of React Flow `Node<NodeData>` objects representing all nodes in the workflow diagram.
 */

export const generateNodes = (
  triggers: TAutomationTrigger[],
  actions: TAutomationAction[],
  workflows: TAutomationWorkflowNode[],
  props: any = {},
) => {
  if (triggers.length === 0 && actions.length === 0) {
    return [
      {
        id: 'scratch-node',
        type: 'scratch',
        data: props,
        position: { x: 0, y: 0 },
      },
    ];
  }

  const generatedNodes: Node<NodeData>[] = [];

  for (const { type, nodes = [] } of [
    { type: AutomationNodeType.Trigger, nodes: triggers },
    { type: AutomationNodeType.Action, nodes: actions },
    { type: AutomationNodeType.Workflow, nodes: workflows },
  ]) {
    nodes.forEach((node, index) => {
      const nodeData = { ...node, config: node.config ?? {} } as Extract<
        TAutomationNodeState,
        { nodeType: typeof type }
      >;

      const nodesData = nodes.map(
        (n) =>
          ({ ...n, config: n.config ?? {} } as Extract<
            TAutomationNodeState,
            { nodeTyp: typeof type }
          >),
      );

      const generatedNode = generateNode(
        nodeData,
        type,
        nodesData,
        { ...props, nodeIndex: index },
        generatedNodes,
      );

      generatedNodes.push(generatedNode);
    });
  }

  return generatedNodes;
};

import { TDroppedNode } from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import {
  AutomationDropHandlerParams,
  AutomationNodeType,
} from '@/automations/types';
import { generateNode } from '@/automations/utils/automationBuilderUtils/generateNodes';
import { XYPosition } from '@xyflow/react';
import { generateAutomationElementId } from 'ui-modules';

/**
 * Handles the drop event on the automation canvas, allowing
 * users to add triggers or actions by dragging them onto the flow.
 *
 * @param params - The parameters including the drop event, react flow instance,
 * triggers list, and actions list.
 */

const generateNewNode = ({
  draggingNode,
  id,
  position,
}: {
  draggingNode: TDroppedNode;
  id: string;
  position?: XYPosition;
}) => {
  const nodeType = draggingNode.nodeType;

  if (nodeType === AutomationNodeType.Trigger) {
    const { icon, type, label, description, isCustom } = draggingNode;
    return {
      id,
      type,
      config: {},
      icon,
      label,
      description,
      isCustom,
      position,
    };
  }

  if (nodeType === AutomationNodeType.Action) {
    const { icon, label, isCustom, description, type } = draggingNode;
    return {
      id,
      type,
      config: {},
      icon,
      label,
      description,
      isCustom,
      position,
    };
  }
  if (nodeType === AutomationNodeType.Workflow) {
    const { name, description, automationId } = draggingNode;

    return {
      id,
      name: name,
      description,
      position,
      config: {},
      automationId,
    };
  }
};

export const automationDropHandler = ({
  triggers,
  actions,
  workflows,
  event,
  reactFlowInstance,
  getNodes,
}: AutomationDropHandlerParams): {
  newNodeId?: string;
  generatedNode?: any;
  newNode: any;
  nodeType: AutomationNodeType;
} => {
  event.preventDefault();

  const draggingNode = JSON.parse(
    event.dataTransfer.getData('application/reactflow/draggingNode') || '{}',
  ) as TDroppedNode;

  const { nodeType, awaitingToConnectNodeId } = draggingNode;

  const position = reactFlowInstance?.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const id = generateAutomationElementId(
    [...triggers, ...actions, ...(workflows || [])].map((a) => a.id),
  );

  const map = { triggers, actions, workflows };

  const nodes = map[AUTOMATION_NODE_TYPE_LIST_PROERTY[nodeType]] || [];
  const nodeIndex = nodes.length;

  const newNode = generateNewNode({ draggingNode, id, position });
  const generatedNode = generateNode(
    { ...newNode, nodeType } as any,
    nodeType,
    nodes,
    { nodeIndex },
    getNodes(),
  );

  return {
    newNodeId: id,
    generatedNode,
    newNode,
    nodeType,
  };
};

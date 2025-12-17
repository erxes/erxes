import { CONNECTION_PROPERTY_NAME_MAP } from '@/automations/constants';
import { NodeData } from '@/automations/types';
import { TAutomationNodeState } from '@/automations/utils/automationFormDefinitions';
import { Node } from '@xyflow/react';
import {
  TAutomationAction,
  TAutomationTrigger,
  TAutomationWorkflowNode,
} from 'ui-modules';

export const generateNodePosition = (
  nodes: TAutomationAction[] | TAutomationTrigger[] | TAutomationWorkflowNode[],
  node: TAutomationNodeState,
  generatedNodes: Node<NodeData>[],
) => {
  if (node.position) {
    if (
      generatedNodes.find(
        (generatedNode) =>
          generatedNode?.position?.x === node?.position?.x &&
          generatedNode?.position?.y === node?.position?.y,
      )
    ) {
      return {
        x: (node?.position?.x || 0) + 10,
        y: (node?.position?.y || 0) + 10,
      };
    }
    return node.position;
  }

  const targetField = CONNECTION_PROPERTY_NAME_MAP[node.nodeType];

  const prevNode = nodes.find((n: any) => n[targetField] === node.id);

  if (!prevNode) {
    return { x: 0, y: 0 };
  }

  const { position } = prevNode;

  return {
    x: position?.x + 500,
    y: position?.y,
  };
};

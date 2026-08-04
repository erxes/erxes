import { CONNECTION_PROPERTY_NAME_MAP } from '@/automations/constants';
import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
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
  flowDirection: TAutomationFlowDirection = 'horizontal',
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
    // Cross-type fallback: search already-generated nodes for one that points to this node
    const crossTypePrev = generatedNodes.find((gn) => {
      const d = gn.data as any;
      return (
        d.actionId === node.id ||
        d.nextActionId === node.id ||
        d.workflowId === node.id
      );
    });

    if (!crossTypePrev) {
      return { x: 0, y: 0 };
    }

    const base = crossTypePrev.position || { x: 0, y: 0 };
    if (flowDirection === 'vertical') {
      return { x: base.x, y: base.y + 300 };
    }
    return { x: base.x + 500, y: base.y };
  }

  const generatedPrevNode = generatedNodes.find(
    (generatedNode) => generatedNode.id === prevNode.id,
  );
  const position = prevNode.position ||
    generatedPrevNode?.position || {
      x: 0,
      y: 0,
    };

  if (flowDirection === 'vertical') {
    return {
      x: position?.x,
      y: position?.y + 300,
    };
  }

  return {
    x: position?.x + 500,
    y: position?.y,
  };
};

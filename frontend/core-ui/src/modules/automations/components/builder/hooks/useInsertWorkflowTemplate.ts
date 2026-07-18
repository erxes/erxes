import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { TWorkflowInputBindings } from '@/automations/utils/workflowInputs';
import { Node, useReactFlow } from '@xyflow/react';
import { generateAutomationElementId, TAutomationAction } from 'ui-modules';

export type TWorkflowTemplate = {
  _id: string;
  name: string;
  description?: string;
  entryActionId?: string;
  actions: TAutomationAction[];
  // Default binding expressions for the derived input.* refs in actions
  inputs?: TWorkflowInputBindings;
  createdAt?: string;
};

export const useInsertWorkflowTemplate = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { triggers, actions, workflows } = useAutomationNodes();
  const { reactFlowInstance } = useAutomation();
  const { getNodes } = useReactFlow<Node<NodeData>>();

  const insertTemplate = (
    template: TWorkflowTemplate,
    position?: { x: number; y: number },
  ) => {
    const usedIds = [...triggers, ...actions, ...(workflows || [])].map(
      (node) => node.id,
    );

    // Give every member a fresh id. Substituting on the serialized snapshot
    // rewrites ids, internal connections (nextActionId, optionalConnects,
    // branches) and {{ actions.<id>.* }} placeholders in one pass.
    let json = JSON.stringify({
      actions: template.actions || [],
      entryActionId: template.entryActionId,
    });

    for (const action of template.actions || []) {
      const newId = generateAutomationElementId(usedIds);
      usedIds.push(newId);
      json = json.split(action.id).join(newId);
    }

    const { actions: newMembers, entryActionId } = JSON.parse(json) as {
      actions: TAutomationAction[];
      entryActionId?: string;
    };

    const workflowId = generateAutomationElementId(usedIds);
    const visibleNodes = getNodes().filter((node) => node.type !== 'scratch');
    const rightMostNode = visibleNodes.length
      ? visibleNodes.reduce((rightMost, node) =>
          node.position.x > rightMost.position.x ? node : rightMost,
        )
      : null;

    const newWorkflow = {
      id: workflowId,
      name: template.name,
      description: template.description || '',
      automationId: '',
      // Keeps the link so later edits can offer to update the template
      templateId: template._id,
      actions: newMembers,
      config: {
        entryActionId,
        ...(template.inputs && Object.keys(template.inputs).length
          ? { inputs: template.inputs }
          : {}),
      },
      position:
        position ??
        (rightMostNode
          ? { x: rightMostNode.position.x + 500, y: rightMostNode.position.y }
          : { x: 0, y: 0 }),
    };

    setAutomationBuilderFormValue(AutomationNodesType.Workflows, [
      ...(workflows || []),
      newWorkflow,
    ]);

    // Only jump the viewport when the caller didn't place the node itself
    if (!position) {
      reactFlowInstance?.fitView({
        nodes: [{ id: workflowId }],
        duration: 300,
      });
    }
  };

  return { insertTemplate };
};

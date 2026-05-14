import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { generateNode } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  TAutomationBuilderForm,
  TAutomationNodeState,
} from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { useFormContext } from 'react-hook-form';
export const useActionsWorkflowNode = (automationId: string) => {
  const { getNodes, setNodes } = useReactFlow<Node<NodeData>>();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const workflows = getValues('workflows') || [];
  const { selectedActionIds = [] } =
    workflows.find((workflow) => workflow?.automationId === automationId)
      ?.config || {};
  const onSelectActionWorkflow = (actionId: string, checked: boolean) => {
    const updateWorkflows = (getValues('workflows') || []).map((workflow) => {
      if (workflow.automationId) {
        let { selectedActionIds = [] } = workflow?.config || {};

        selectedActionIds = !checked
          ? selectedActionIds.filter(
              (selectedActionId: string) => selectedActionId !== actionId,
            )
          : [...selectedActionIds, actionId];

        return {
          ...workflow,
          config: {
            ...workflow.config,
            selectedActionIds,
          },
        };
      }
      return workflow;
    });

    const updatedNodes = updateWorkflows.map((workflow) =>
      generateNode(
        workflow as Extract<
          TAutomationNodeState,
          { nodeType: AutomationNodeType.Workflow }
        >,
        AutomationNodeType.Workflow,
        updateWorkflows || [],
        {},
        getNodes(),
      ),
    );

    setNodes((nodes) =>
      nodes.map((node) => {
        const updated = updatedNodes.find((n) => n.id === node.id);
        return updated ? updated : node;
      }),
    );

    setAutomationBuilderFormValue('workflows', updateWorkflows);
  };

  return {
    selectedActionIds,
    onSelectActionWorkflow,
  };
};

import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Node, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

// Inline label/description editing for the active node of any type. Writes the
// form entry via its formPath (workflows store the title as `name`,
// triggers/actions as `label`) and syncs the React Flow node data.
export const useNodeMetaEdit = (activeNode?: NodeData) => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { updateNodeData, getNode } = useReactFlow<Node<NodeData>>();
  const { queryParams } = useAutomation();

  const updateMeta = useCallback(
    (key: 'label' | 'description', value: string) => {
      const nodeId = queryParams?.activeNodeId;

      if (!activeNode?.formPath || !nodeId) {
        return;
      }

      const entryKey =
        key === 'label' && activeNode.nodeType === AutomationNodeType.Workflow
          ? 'name'
          : key;
      const formPath = activeNode.formPath as FieldPath<TAutomationBuilderForm>;
      const currentEntry = (getValues(formPath) as Record<string, any>) || {};
      const currentNode = getNode(nodeId);

      setAutomationBuilderFormValue(
        formPath,
        {
          ...currentEntry,
          [entryKey]: value,
          position: currentNode?.position ?? currentEntry?.position,
        },
        { shouldDirty: true },
      );
      updateNodeData(nodeId, { ...activeNode, [key]: value });
    },
    [
      activeNode,
      queryParams?.activeNodeId,
      getValues,
      getNode,
      setAutomationBuilderFormValue,
      updateNodeData,
    ],
  );

  return { updateMeta, activeNodeId: queryParams?.activeNodeId };
};

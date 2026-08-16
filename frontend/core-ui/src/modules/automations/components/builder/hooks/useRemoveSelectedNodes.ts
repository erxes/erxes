import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { NodeData } from '@/automations/types';
import { removeNodesReferences } from '@/automations/utils/automationBuilderUtils/connectionUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

// Removes several canvas nodes at once (marquee selection). The canvas is
// regenerated from the form afterwards, so the empty-state node comes back on
// its own once every list is cleared.
export const useRemoveSelectedNodes = () => {
  const { queryParams, setQueryParams, actionFolks } = useAutomation();
  const { setNodes, setEdges } = useReactFlow<Node<NodeData>, Edge>();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const removeNodes = useCallback(
    (nodeIds: string[]) => {
      if (!nodeIds.length) {
        return;
      }

      const removed = new Set(nodeIds);
      const {
        updatedActions,
        updatedTriggers,
        updatedWorkflows,
        actionMap,
        triggerMap,
      } = removeNodesReferences({
        removedNodeIds: nodeIds,
        actions: getValues('actions') || [],
        triggers: getValues('triggers') || [],
        workflows: getValues('workflows') || [],
        actionFolks,
      });

      setEdges((edges) =>
        edges.filter(
          (edge) => !removed.has(edge.source) && !removed.has(edge.target),
        ),
      );

      setNodes((nodes) =>
        nodes
          .filter((node) => !removed.has(node.id))
          .map((node) => {
            const updatedData =
              actionMap.get(node.id) || triggerMap.get(node.id);

            if (!updatedData) {
              return node;
            }

            return {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
              },
            };
          }),
      );

      setAutomationBuilderFormValue('actions', updatedActions);
      setAutomationBuilderFormValue('triggers', updatedTriggers);
      setAutomationBuilderFormValue('workflows', updatedWorkflows);

      if (queryParams?.activeNodeId && removed.has(queryParams.activeNodeId)) {
        setQueryParams({ activeNodeId: null });
      }
    },
    [
      actionFolks,
      getValues,
      queryParams?.activeNodeId,
      setAutomationBuilderFormValue,
      setEdges,
      setNodes,
      setQueryParams,
    ],
  );

  return { removeNodes };
};

import { AUTOMATION_NODE_TYPE_LIST_PROERTY } from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeEvents } from '@/automations/hooks/useNodeEvents';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { removeNodeReferences } from '@/automations/utils/automationBuilderUtils/connectionUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const useNodeDropDownActions = (
  id: string,
  nodeType: AutomationNodeType,
) => {
  // hooks
  const { queryParams, setQueryParams, actionFolks } = useAutomation();
  const { setNodes, setEdges } = useReactFlow<Node<NodeData>, Edge>();
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { openNodeConfigurationForm } = useNodeEvents();
  // states
  const [isOpenDropDown, setOpenDropDown] = useState(false);
  const [isOpenDialog, setOpenDialog] = useState(false);
  const [isOpenRemoveAlert, setOpenRemoveAlert] = useState(false);

  const fieldName = AUTOMATION_NODE_TYPE_LIST_PROERTY[nodeType];

  const onRemoveNode = () => {
    const actions = getValues('actions') || [];
    const triggers = getValues('triggers') || [];
    const { actionMap, triggerMap, updatedActions, updatedTriggers } =
      removeNodeReferences({
        removedNodeId: id,
        actions,
        triggers,
        actionFolks,
      });

    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));

    setNodes((nodes) =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          const updatedData = actionMap.get(node.id) || triggerMap.get(node.id);

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

    if (queryParams?.activeNodeId === id) {
      setQueryParams({ activeNodeId: null });

      if (nodeType === AutomationNodeType.Trigger && !updatedTriggers?.length) {
        setNodes([
          {
            id: 'scratch-node',
            type: 'scratch',
            data: {} as any,
            position: { x: 0, y: 0 },
          },
        ]);
      }
    }
  };

  return {
    fieldName,
    isOpenDialog,
    isOpenDropDown,
    isOpenRemoveAlert,
    setOpenRemoveAlert,
    setOpenDialog,
    setOpenDropDown,
    onRemoveNode,
    openNodeConfigurationForm,
  };
};

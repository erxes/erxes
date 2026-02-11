import {
  AUTOMATION_NODE_TYPE_LIST_PROERTY,
  CONNECTION_PROPERTY_NAME_MAP,
} from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import {
  AutomationNodesType,
  AutomationNodeType,
  NodeData,
} from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const useNodeDropDownActions = (
  id: string,
  nodeType: AutomationNodeType,
) => {
  const { queryParams, setQueryParams } = useAutomation();
  const { setNodes, setEdges } = useReactFlow<Node<NodeData>, Edge>();

  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const [isOpenDropDown, setOpenDropDown] = useState(false);
  const [isOpenDialog, setOpenDialog] = useState(false);
  const [isOpenRemoveAlert, setOpenRemoveAlert] = useState(false);

  const fieldName = AUTOMATION_NODE_TYPE_LIST_PROERTY[nodeType];
  const actionFieldName = CONNECTION_PROPERTY_NAME_MAP[nodeType];

  const onRemoveNode = () => {
    const nodes = getValues(`${fieldName}`) || [];
    const updatedNodes = nodes
      .map((node: any) =>
        node[actionFieldName] === id
          ? { ...node, [actionFieldName]: undefined }
          : node,
      )
      .filter((node) => node.id !== id);
    // remove connected edges to this node (as source or target)
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setAutomationBuilderFormValue(`${fieldName}`, updatedNodes);

    if (queryParams?.activeNodeId === id) {
      setQueryParams({ activeNodeId: null });
      if (fieldName === AutomationNodesType.Triggers && !updatedNodes?.length) {
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
  };
};

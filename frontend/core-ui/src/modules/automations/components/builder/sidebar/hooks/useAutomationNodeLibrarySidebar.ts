import {
  TDraggingNode,
  TDroppedNode,
} from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import {
  AUTOMATION_NODE_TYPE_LIST_PROERTY,
  CONNECTION_PROPERTY_NAME_MAP,
} from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { generateNewNode } from '@/automations/utils/automationBuilderUtils/dropNodeHandler';
import { generateNode } from '@/automations/utils/automationBuilderUtils/generateNodes';
import { splitAwaitingConnectionId } from '@/automations/utils/automationConnectionUtils';
import { Node, useReactFlow } from '@xyflow/react';
import React from 'react';
import {
  generateAutomationElementId,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

type AutomationNodeLibraryType =
  | AutomationNodeType.Action
  | AutomationNodeType.Trigger;

type TSelectableNode = Extract<
  TDraggingNode,
  { nodeType: AutomationNodeLibraryType }
>;

type TAutomationNodesLibraryMap = Record<
  AutomationNodeLibraryType,
  {
    title: string;
    description: string;
    list:
      | IAutomationsActionConfigConstants[]
      | IAutomationsTriggerConfigConstants[];
  }
>;

export const useAutomationNodeLibrarySidebar = () => {
  const {
    awaitingToConnectNodeId,
    queryParams,
    setQueryParams,
    setAwaitingToConnectNodeId,
  } = useAutomation();
  const activeNodeTab =
    queryParams?.activeNodeTab ?? AutomationNodeType.Trigger;
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { triggers, actions, workflows, getList } = useAutomationNodes();
  const { getNodes, getNode, addNodes, setNodes } =
    useReactFlow<Node<NodeData>>();
  const { onAwaitingNodeConnection } = useNodeConnect();

  const { triggersConst, actionsConst, loading, error, refetch } =
    useAutomation();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    draggingNode: TDraggingNode,
  ) => {
    const data: TDroppedNode =
      draggingNode.nodeType === AutomationNodeType.Workflow
        ? {
            nodeType: AutomationNodeType.Workflow,
            automationId: draggingNode.automationId,
            name: draggingNode.name,
            description: draggingNode.description,
          }
        : {
            nodeType: draggingNode.nodeType,
            type: draggingNode.type,
            label: draggingNode.label,
            description: draggingNode.description,
            icon: draggingNode.icon,
            isCustom: draggingNode.isCustom,
            awaitingToConnectNodeId,
          };

    event.dataTransfer.setData(
      'application/reactflow/draggingNode',
      JSON.stringify(data),
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const getClickPosition = (nodeType: TSelectableNode['nodeType']) => {
    if (awaitingToConnectNodeId) {
      const [, awaitingNodeId] = splitAwaitingConnectionId(
        awaitingToConnectNodeId,
      );
      const sourceNode = getNode(awaitingNodeId);

      if (sourceNode?.position) {
        return {
          x: sourceNode.position.x + 500,
          y: sourceNode.position.y,
        };
      }
    }

    const visibleNodes = getNodes().filter((node) => node.type !== 'scratch');
    const targetField = CONNECTION_PROPERTY_NAME_MAP[nodeType];
    const currentList = getList(nodeType);
    const previousNode = [...currentList]
      .reverse()
      .find((node) => !(node as any)[targetField]);

    if (previousNode?.position) {
      return {
        x: previousNode.position.x + 500,
        y: previousNode.position.y,
      };
    }

    if (visibleNodes.length > 0) {
      const rightMostNode = visibleNodes.reduce((rightMost, node) =>
        node.position.x > rightMost.position.x ? node : rightMost,
      );

      return {
        x: rightMostNode.position.x + 500,
        y: rightMostNode.position.y,
      };
    }

    return { x: 0, y: 0 };
  };

  const onSelectNode = (draggingNode: TSelectableNode) => {
    const { nodeType } = draggingNode;
    const id = generateAutomationElementId(
      [...triggers, ...actions, ...(workflows || [])].map((node) => node.id),
    );
    const listFieldName = AUTOMATION_NODE_TYPE_LIST_PROERTY[nodeType];
    const list = getList(nodeType);
    const position = getClickPosition(nodeType);
    const newNode = generateNewNode({
      draggingNode: {
        ...draggingNode,
        awaitingToConnectNodeId,
      } as TDroppedNode,
      id,
      position,
    });

    const generatedNode = generateNode(
      { ...newNode, nodeType } as any,
      nodeType,
      list,
      { nodeIndex: list.length },
      getNodes(),
    );

    setAutomationBuilderFormValue(listFieldName, [...list, newNode]);
    addNodes(generatedNode);

    if (awaitingToConnectNodeId) {
      onAwaitingNodeConnection(awaitingToConnectNodeId, id, generatedNode);
      setAwaitingToConnectNodeId('');
    }

    setNodes((nodes) => nodes.filter((node) => node.type !== 'scratch'));
    setQueryParams({ activeNodeId: id });
  };

  const AutomationNodesLibraryMap: TAutomationNodesLibraryMap = {
    [AutomationNodeType.Action]: {
      title: 'choose-action-type',
      description: 'action-type-description',
      list: actionsConst,
    },
    [AutomationNodeType.Trigger]: {
      title: 'choose-trigger-type',
      description: 'trigger-type-description',
      list: triggersConst,
    },
  };
  const activeTab = awaitingToConnectNodeId
    ? AutomationNodeType.Action
    : (activeNodeTab as AutomationNodeLibraryType);

  const config =
    AutomationNodesLibraryMap[activeTab] ||
    AutomationNodesLibraryMap[AutomationNodeType.Trigger];
  return {
    activeNodeTab: activeTab,
    setQueryParams,
    loading,
    triggersConst,
    actionsConst,
    onDragStart,
    onSelectNode,
    error,
    refetch,
    config,
  };
};

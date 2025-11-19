import {
  TDraggingNode,
  TDroppedNode,
} from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import React from 'react';

export const useAutomationNodeLibrarySidebar = () => {
  const { awaitingToConnectNodeId, queryParams, setQueryParams } =
    useAutomation();
  const { activeNodeTab } = queryParams || {};

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

  return {
    activeNodeTab: awaitingToConnectNodeId
      ? AutomationNodeType.Action
      : activeNodeTab,
    setQueryParams,
    loading,
    triggersConst,
    actionsConst,
    onDragStart,
    error,
    refetch,
  };
};

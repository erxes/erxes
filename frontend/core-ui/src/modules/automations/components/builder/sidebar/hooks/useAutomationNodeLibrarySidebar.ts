import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import React, { useMemo } from 'react';
import {
  IAutomationNodeConfigConstants,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import { TAutomationNodeState } from '@/automations/utils/automationFormDefinitions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { splitAwaitingConnectionId } from '@/automations/utils/automationConnectionUtils';
import {
  TDraggingNode,
  TDroppedNode,
} from '@/automations/components/builder/sidebar/states/automationNodeLibrary';

export const useAutomationNodeLibrarySidebar = () => {
  const { awaitingToConnectNodeId, queryParams, setQueryParams } =
    useAutomation();
  const { activeNodeTab } = queryParams || {};

  const { triggers, actions, getList } = useAutomationNodes();

  const { triggersConst, actionsConst, loading, error, refetch } =
    useAutomation();

  const filteredActionsConst = useMemo(() => {
    if (!awaitingToConnectNodeId) return actionsConst;

    const [nodeType, nodeId] = splitAwaitingConnectionId(
      awaitingToConnectNodeId,
    );

    const nodeList = getList(nodeType);
    const { type: nodeTypeValue } = nodeList.find(
      (node: any) => node.id === nodeId,
    ) as Extract<TAutomationNodeState, { type: typeof nodeType }>;

    const constantsMap: {
      [AutomationNodeType.Trigger]: IAutomationsTriggerConfigConstants[];
      [AutomationNodeType.Action]: IAutomationsActionConfigConstants[];
    } = {
      [AutomationNodeType.Trigger]: triggersConst,
      [AutomationNodeType.Action]: actionsConst,
    };

    const connectableActionTypes =
      constantsMap[nodeType].find(
        ({ type }: IAutomationNodeConfigConstants) => type === nodeTypeValue,
      )?.connectableActionTypes ?? [];

    if (!connectableActionTypes?.length) {
      return actionsConst;
    }

    return actionsConst.filter(
      (action) =>
        isCoreAutomationActionType(
          action?.type,
          TAutomationActionComponent.Sidebar,
        ) || connectableActionTypes.includes(action.type),
    );
  }, [awaitingToConnectNodeId, triggers, actions, actionsConst, triggersConst]);

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
    actionsConst: filteredActionsConst,
    onDragStart,
    error,
    refetch,
  };
};

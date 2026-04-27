import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import {
  splitAutomationNodeType,
  TAutomationTrigger,
  TAutomationAction,
  IAutomationsActionConfigConstants,
} from 'ui-modules';

const getTargetType = (
  actionConstMap: Map<string, IAutomationsActionConfigConstants>,
  currentAction: TAutomationAction | null,
  actions: TAutomationAction[],
  trigger?: TAutomationTrigger,
) => {
  if (currentAction?.targetActionId) {
    const actionType = actions.find(
      (a) => a.id === currentAction?.targetActionId,
    )?.type;

    const { targetSourceType } = actionConstMap.get(actionType ?? '') || {};
    return targetSourceType;
  }
  return trigger?.type;
};

export const useAutomationActionContentSidebar = () => {
  const { queryParams, setQueryParams, actionConstMap, actionFolks } =
    useAutomation();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { getNode, updateNodeData } = useReactFlow<Node<NodeData>>();
  const { actions, triggers } = useAutomationNodes();

  // Watch all actions once

  // Find the index of the active node by id
  const currentIndex = actions.findIndex(
    (action) => action.id === queryParams?.activeNodeId,
  );

  // Safely get currentAction, guard against -1
  const currentAction = currentIndex >= 0 ? actions[currentIndex] : null;

  const trigger = getTriggerOfAction(
    queryParams?.activeNodeId ?? '',
    actions,
    triggers,
    actionFolks,
  );

  const targetType = getTargetType(
    actionConstMap,
    currentAction,
    actions,
    trigger,
  );
  // Pick component from Actions map or fallback to null

  const isCoreActionComponent = isCoreAutomationActionType(
    currentAction?.type || '',
    TAutomationActionComponent.Sidebar,
  );

  const [pluginName, moduleName] = splitAutomationNodeType(
    currentAction?.type || '',
  );

  const onSaveActionConfigCallback = () => {
    setQueryParams({ activeNodeId: null });
    toggleSideBarOpen();
    toast({
      title: 'Action configuration added successfully.',
      variant: 'success',
    });
  };

  const onSaveActionConfig = (config: any) => {
    setAutomationBuilderFormValue(
      `${AutomationNodesType.Actions}.${currentIndex}.config`,
      config,
    );
    if (currentAction) {
      const node = getNode(currentAction.id);
      updateNodeData(currentAction.id, { ...node?.data, config });
    }
    onSaveActionConfigCallback();
  };

  return {
    isCoreActionComponent,
    currentIndex,
    currentAction,
    setQueryParams,
    toggleSideBarOpen,
    onSaveActionConfig,
    pluginName,
    moduleName,
    trigger,
    targetType,
  };
};

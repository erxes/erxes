import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import {
  IAutomationsActionConfigConstants,
  splitAutomationNodeType,
  TAutomationAction,
  TAutomationTrigger,
} from 'ui-modules';
import { useNodeErrorHandler } from '../../hooks/useNodeErrorHandler';

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
  const {
    queryParams,
    setQueryParams,
    actionConstMap,
    actionFolks,
    toggleSidebar: toggleSideBarOpen,
  } = useAutomation();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getNode, updateNodeData } = useReactFlow<Node<NodeData>>();
  const { actions, triggers } = useAutomationNodes();
  const { clearNodeError } = useNodeErrorHandler();

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
    currentAction && clearNodeError(currentAction.id);
  };

  const onSaveActionConfig = (config: any) => {
    const prevConfig = currentAction?.config || {};

    const updatedConfig = { ...prevConfig, ...config };

    setAutomationBuilderFormValue(
      `${AutomationNodesType.Actions}.${currentIndex}.config`,
      updatedConfig,
    );
    if (currentAction) {
      const node = getNode(currentAction.id);
      updateNodeData(currentAction.id, {
        ...node?.data,
        config: updatedConfig,
      });
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

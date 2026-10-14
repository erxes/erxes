import { isCoreAutomationActionType } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType, NodeData } from '@/automations/types';
import {
  getConnectedPreviousActions,
  getTriggerOfAction,
} from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { Node, useReactFlow } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useMemo } from 'react';
import { useSavedConditionals } from '@/automations/components/builder/sidebar/hooks/useSavedConditionals';
import {
  AUTOMATION_CONDITIONALS_KEY,
  finalizeAutomationConditionals,
  IAutomationsActionConfigConstants,
  splitAutomationNodeType,
  TAutomationAction,
  TAutomationConditionalErrors,
  TAutomationConditionals,
  TAutomationTrigger,
  useAutomationConditionalsStore,
} from 'ui-modules';
import { useNodeErrorHandler } from '../../hooks/useNodeErrorHandler';
import { useTranslation } from 'react-i18next';

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

const describeConditionalErrors = (
  errors: TAutomationConditionalErrors,
  conditionals: TAutomationConditionals,
) => {
  const [id, [firstError]] = Object.entries(errors)[0];
  const label = conditionals[id]?.label;

  return label ? `${label}: ${firstError}` : firstError;
};

export const useAutomationActionContentSidebar = () => {
  const { t } = useTranslation('automations');
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

  const conditionalsStore = useAutomationConditionalsStore(
    currentAction?.id,
    useSavedConditionals(currentAction?.config),
  );

  const trigger = getTriggerOfAction(
    queryParams?.activeNodeId ?? '',
    actions,
    triggers,
    actionFolks,
  );

  const previousActions = useMemo(
    () =>
      getConnectedPreviousActions(
        queryParams?.activeNodeId ?? '',
        actions,
        actionFolks,
      ),
    [queryParams?.activeNodeId, actions, actionFolks],
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
      title: t('sidebar-action-configuration-added'),
      variant: 'success',
    });
    currentAction && clearNodeError(currentAction.id);
  };

  const onSaveActionConfig = (config: any) => {
    const prevConfig = currentAction?.config || {};
    const merged = Object.fromEntries(
      Object.entries({ ...prevConfig, ...config }).filter(
        ([key]) => key !== AUTOMATION_CONDITIONALS_KEY,
      ),
    );

    // Only conditionals the config still points at are kept, and all of them
    // must be complete before anything is written
    const { conditionals, errors } = finalizeAutomationConditionals(
      merged,
      conditionalsStore.getSnapshot(),
    );

    if (Object.keys(errors).length) {
      conditionalsStore.setErrors(errors);
      toast({
        title: describeConditionalErrors(errors, conditionals),
        variant: 'destructive',
      });
      return;
    }

    const updatedConfig = Object.keys(conditionals).length
      ? { ...merged, [AUTOMATION_CONDITIONALS_KEY]: conditionals }
      : merged;

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
    conditionalsStore,
    pluginName,
    moduleName,
    trigger,
    targetType,
    previousActions,
  };
};

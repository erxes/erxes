import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import {
  getConnectedPreviousActions,
  getTriggerOfAction,
} from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useMemo } from 'react';
import {
  IAutomationsActionConfigConstants,
  TAutomationAction,
} from 'ui-modules';

export const useActionTarget = ({
  actionId,
  targetActionId,
}: {
  actionId?: string;
  targetActionId?: string;
}) => {
  const { actionsConst, actionConstMap } = useAutomation();
  const { actions, triggers } = useAutomationNodes();
  const { actionFolks } = useAutomation();
  const trigger = useMemo(
    () =>
      actionId
        ? getTriggerOfAction(actionId, actions, triggers, actionFolks)
        : undefined,
    [actionId, actions, triggers, actionFolks],
  );

  const actionTypesCanBeTarget = actionsConst
    .filter(({ isTargetSource }) => isTargetSource)
    .map(({ type }) => type);
  const connectedPreviousActions = actionId
    ? getConnectedPreviousActions(actionId, actions, actionFolks)
    : [];

  // Filter to only those previous actions whose type can be a target
  const actionsCanBeTarget = connectedPreviousActions.filter(
    ({ type, config }, index) => {
      let isActionCanBeTarget = actionTypesCanBeTarget.includes(type);

      if (type === 'findObject') {
        isActionCanBeTarget =
          isActionCanBeTarget &&
          config?.isExists === connectedPreviousActions[index + 1]?.id;
      }

      return isActionCanBeTarget;
    },
  );

  let selectedActionType = trigger?.type;
  if (targetActionId) {
    const { type, config } =
      actionsCanBeTarget.find((a) => a.id === targetActionId) || {};

    if (type === 'findObject') {
      selectedActionType = config?.propertyType;
    } else {
      const { targetSourceType } = actionConstMap.get(type ?? '') || {};

      selectedActionType = targetSourceType || type;
    }
  }
  return {
    selectedActionType,
    actionsCanBeTarget,
    actionTypesCanBeTarget,
  };
};

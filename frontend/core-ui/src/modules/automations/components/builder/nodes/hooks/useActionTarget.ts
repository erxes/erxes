import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import {
  getConnectedNextActions,
  getConnectedPreviousActions,
  getTriggerOfAction,
} from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useMemo } from 'react';
import { TAutomationAction, TAutomationOptionalConnect } from 'ui-modules';

const ACTION_TYPES_CANNOT_BE_SELECTED_AS_TARGET = ['waitEvent'];
const ACTION_TYPE_READING_AI_MEMORY = 'setProperty';

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

      if (ACTION_TYPES_CANNOT_BE_SELECTED_AS_TARGET.includes(type)) {
        return false;
      }

      if (type === 'findObject') {
        isActionCanBeTarget =
          isActionCanBeTarget &&
          config?.isExists === connectedPreviousActions[index + 1]?.id;
      }

      return isActionCanBeTarget;
    },
  );

  // A record made on another tool branch of the same AI agent: that branch
  // ran in an earlier conversation turn, and the agent remembers what it made.
  // Only Manage properties reads that memory when it runs.
  const readsAiMemory =
    actions.find(({ id }) => id === actionId)?.type ===
    ACTION_TYPE_READING_AI_MEMORY;
  const siblingBranchActions = (readsAiMemory ? connectedPreviousActions : [])
    .filter(({ type }) => type === 'aiAgent')
    .flatMap(({ config }) =>
      (config?.optionalConnects || [])
        .map(({ actionId: branchStartId }: TAutomationOptionalConnect) =>
          branchStartId
            ? getConnectedNextActions(branchStartId, actions, actionFolks)
            : [],
        )
        .filter(
          (branch: TAutomationAction[]) =>
            !branch.some(({ id }) => id === actionId),
        ),
    )
    .flat()
    .filter(
      ({ id, type }) =>
        type !== 'findObject' &&
        actionTypesCanBeTarget.includes(type) &&
        !actionsCanBeTarget.some((action) => action.id === id),
    )
    .filter(
      (action, index, list) =>
        list.findIndex(({ id }) => id === action.id) === index,
    );
  const targetOptions = [...actionsCanBeTarget, ...siblingBranchActions];

  let selectedActionType = trigger?.type;
  if (targetActionId) {
    const { type, config } =
      targetOptions.find((a) => a.id === targetActionId) || {};

    if (type === 'findObject') {
      selectedActionType = config?.objectType;
    } else {
      const { targetSourceType } = actionConstMap.get(type ?? '') || {};

      selectedActionType = targetSourceType || type;
    }
  }

  return {
    selectedActionType,
    actionsCanBeTarget: targetOptions,
    actionTypesCanBeTarget,
  };
};

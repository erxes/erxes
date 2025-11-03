import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import {
  IAutomationsActionConfigConstants,
  TAutomationAction,
} from 'ui-modules';

function getConnectionsBefore(
  targetId: string,
  actions: TAutomationAction[],
  actionsConst: IAutomationsActionConfigConstants[],
) {
  const map = new Map(actions.map((a) => [a.id, a]));
  const result: TAutomationAction[] = [];

  function findPrevious(currentId: string) {
    const prev = actions.find(({ nextActionId, config, type }) => {
      if (nextActionId === currentId) {
        return true;
      } else {
        const folks =
          actionsConst.find((actionConst) => actionConst.type === type)
            ?.folks || [];
        for (const folk of folks) {
          if (config[folk.key] === currentId) {
            return true;
          }
        }
      }
      const optionalConnects = config?.optionalConnects || [];
      for (const connect of optionalConnects) {
        if (connect.actionId === currentId) {
          return true;
        }
      }
    });
    if (prev) {
      result.unshift(prev); // add to the beginning
      findPrevious(prev.id);
    }
  }

  findPrevious(targetId);
  return result;
}

export const useActionTarget = ({
  actionId,
  targetActionId,
}: {
  actionId?: string;
  targetActionId?: string;
}) => {
  const { actionsConst } = useAutomation();
  const { actions } = useAutomationNodes();

  const actionTypesCanBeTarget = actionsConst
    .filter(({ isTargetSource }) => isTargetSource)
    .map(({ type }) => type);
  const connectedPreviousActions = actionId
    ? getConnectionsBefore(actionId, actions, actionsConst)
    : [];

  // Filter to only those previous actions whose type can be a target
  const actionsCanBeTarget = connectedPreviousActions.filter(({ type }) =>
    actionTypesCanBeTarget.includes(type),
  );
  const selectedActionType = targetActionId
    ? actionsCanBeTarget.find((a) => a.id === targetActionId)?.type
    : undefined;
  return {
    selectedActionType,
    actionsCanBeTarget,
    actionTypesCanBeTarget,
  };
};

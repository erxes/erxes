import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationAction } from 'ui-modules';

export function useWaitEventConfigContent(
  targetType: TAutomationWaitEventConfig['targetType'],
  action: TAutomationAction,
  selectedNodeId?: string,
) {
  const { actionFolks, actionsConst } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  if (targetType === WaitEventTargetTypes.Trigger) {
    const trigger = getTriggerOfAction(
      action.id,
      actions,
      triggers,
      actionFolks,
    );

    return { contentType: trigger?.type };
  }

  const selectedAction = actions.find((a) => a.id === selectedNodeId);
  const selectedActionType = actionsConst.find(
    (a) => a.type === selectedAction?.type,
  )?.targetSourceType;
  return {
    contentType: selectedActionType,
  };
}

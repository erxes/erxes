import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationAction } from 'ui-modules';

export function useWaitEventConfigContent(
  targetType: TAutomationWaitEventConfig['targetType'],
  action: TAutomationAction,
  selectedNodeId?: string,
) {
  const { actions, triggers } = useAutomationNodes();

  if (targetType === WaitEventTargetTypes.Trigger) {
    const trigger = getTriggerOfAction(action.id, actions, triggers);

    return { contentType: trigger?.type };
  }

  return {
    contentType: actions.find((a) => a.id === selectedNodeId)?.type,
  };
}

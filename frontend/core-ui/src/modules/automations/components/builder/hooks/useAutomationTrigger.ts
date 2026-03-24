import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';

export const useAutomationTrigger = (currentActionId: string) => {
  const { actionFolks } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  const trigger = getTriggerOfAction(
    currentActionId,
    actions,
    triggers,
    actionFolks,
  );

  return {
    trigger,
  };
};

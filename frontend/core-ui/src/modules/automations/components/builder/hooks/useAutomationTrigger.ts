import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';

export const useAutomationTrigger = (currentActionId: string) => {
  const { actions, triggers } = useAutomationNodes();

  const trigger = getTriggerOfAction(currentActionId, actions, triggers);

  return {
    trigger,
  };
};

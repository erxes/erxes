import { findTriggerForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useWatch } from 'react-hook-form';

export const useAutomationTrigger = (currentActionId: string) => {
  const [actions = [], triggers = []] = useWatch<TAutomationBuilderForm>({
    name: ['actions', 'triggers'],
  });

  const trigger = findTriggerForAction(currentActionId, actions, triggers);

  return {
    trigger,
  };
};

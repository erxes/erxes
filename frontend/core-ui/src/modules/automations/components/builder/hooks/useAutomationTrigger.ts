import { getContentType } from '@/automations/utils/automationBuilderUtils';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { useWatch } from 'react-hook-form';

export const useAutomationTrigger = (currentActionId: string) => {
  const [actions = [], triggers = []] = useWatch<TAutomationBuilderForm>({
    name: ['actions', 'triggers'],
  });

  const trigger = getContentType(currentActionId, actions, triggers);

  return {
    trigger,
  };
};

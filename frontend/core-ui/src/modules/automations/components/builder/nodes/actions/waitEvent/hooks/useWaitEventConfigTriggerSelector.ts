import { getAllTriggersForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext } from 'react-hook-form';

export const useWaitEventConfigTriggerSelector = (actionId: string) => {
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const triggers = getAllTriggersForAction(
    actionId,
    getValues('actions'),
    getValues('triggers'),
  );
  const nonCustomTriggers = triggers.filter(({ trigger }) => !trigger.isCustom);

  return { nonCustomTriggers };
};

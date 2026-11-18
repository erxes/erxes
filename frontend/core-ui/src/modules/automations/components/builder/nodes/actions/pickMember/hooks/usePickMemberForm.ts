import { useAutomation } from '@/automations/context/AutomationProvider';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';
import {
  pickMemberConfigFormSchema,
  TPickMemberConfigForm,
} from '../states/pickMemberConfigForm';

/** The form of a Pick a team member step, and the record type its placeholders read. */
export const usePickMemberForm = (
  currentAction: TAutomationAction<TPickMemberConfigForm>,
) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { actionFolks } = useAutomation();
  const [triggers = [], actions = []] = useWatch<TAutomationBuilderForm>({
    control,
    name: ['triggers', 'actions'],
  });
  const { type: triggerType = '' } =
    getTriggerOfAction(currentAction?.id, actions, triggers, actionFolks) || {};

  const form = useForm<TPickMemberConfigForm>({
    resolver: zodResolver(pickMemberConfigFormSchema),
    defaultValues: {
      candidateIds: currentAction?.config?.candidateIds || '',
      method: currentAction?.config?.method || 'roundRobin',
      fallbackUserId: currentAction?.config?.fallbackUserId || '',
    },
  });

  return { form, propertyType: triggerType };
};

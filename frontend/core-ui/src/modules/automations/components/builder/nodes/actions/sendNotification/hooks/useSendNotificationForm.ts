import { useAutomation } from '@/automations/context/AutomationProvider';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';
import {
  sendNotificationConfigFormSchema,
  TSendNotificationConfigForm,
} from '../states/sendNotificationConfigForm';

/** The form of a Notify team members step, and the record type its placeholders read. */
export const useSendNotificationForm = (
  currentAction: TAutomationAction<TSendNotificationConfigForm>,
) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { actionFolks } = useAutomation();
  const [triggers = [], actions = []] = useWatch<TAutomationBuilderForm>({
    control,
    name: ['triggers', 'actions'],
  });
  const { type: triggerType = '' } =
    getTriggerOfAction(currentAction?.id, actions, triggers, actionFolks) || {};

  const form = useForm<TSendNotificationConfigForm>({
    resolver: zodResolver(sendNotificationConfigFormSchema),
    defaultValues: {
      userIds: currentAction?.config?.userIds || '',
      title: currentAction?.config?.title || '',
      message: currentAction?.config?.message || '',
      priority: currentAction?.config?.priority,
    },
  });

  return { form, propertyType: triggerType };
};

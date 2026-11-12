import { useAutomation } from '@/automations/context/AutomationProvider';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';
import {
  approvalConfigFormSchema,
  TApprovalConfigForm,
} from '../states/approvalConfigForm';

/** The form of an Ask for approval step, and the record type its placeholders read. */
export const useApprovalForm = (
  currentAction: TAutomationAction<TApprovalConfigForm>,
) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { actionFolks } = useAutomation();
  const [triggers = [], actions = []] = useWatch<TAutomationBuilderForm>({
    control,
    name: ['triggers', 'actions'],
  });
  const { type: triggerType = '' } =
    getTriggerOfAction(currentAction?.id, actions, triggers, actionFolks) || {};
  const config = currentAction?.config;

  const form = useForm<TApprovalConfigForm>({
    resolver: zodResolver(approvalConfigFormSchema),
    defaultValues: {
      approverIds: config?.approverIds || '',
      summary: config?.summary || '',
      timeoutHours:
        config?.timeoutHours !== undefined ? String(config.timeoutHours) : '',
      approved: config?.approved,
      rejected: config?.rejected,
    },
  });

  return { form, propertyType: triggerType };
};

import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardEvent } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import {
  sendEmailConfigFormSchema,
  TAutomationSendEmailConfig,
} from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { TAutomationAction } from 'ui-modules';

export const useSendEmailSidebarForm = (
  currentActionIndex: number,
  currentAction: TAutomationAction,
) => {
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;
  const { control: automationBuilderFormControl } =
    useFormContext<TAutomationBuilderForm>();
  const { actionFolks } = useAutomation();
  const [triggers = [], actions = [], config = {}] =
    useWatch<TAutomationBuilderForm>({
      control: automationBuilderFormControl,
      name: ['triggers', 'actions', `${configFieldNamePrefix}`],
    });
  const form = useForm<TAutomationSendEmailConfig>({
    resolver: zodResolver(sendEmailConfigFormSchema),
    defaultValues: {
      fromEmailPlaceHolder: config?.fromEmailPlaceHolder || '',
      toEmailsPlaceHolders: config?.toEmailsPlaceHolders || '',
      ccEmailsPlaceHolders: config?.ccEmailsPlaceHolders || '',
      subject: config?.subject || '',
      content: config?.content || '',
      html: config?.html || '',
      type: config?.type || 'default',
    },
  });

  const { type: triggerType } =
    getTriggerOfAction(currentAction?.id, actions, triggers, actionFolks) || {};
  const { selectedActionType } = useActionTarget({
    actionId: currentAction?.id,
    targetActionId: currentAction?.targetActionId,
  });

  return { form, contentType: selectedActionType || triggerType };
};

export const useSendEmailCustomMailField = (currentActionIndex: number) => {
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const config = useWatch({ control, name: configFieldNamePrefix });

  const removeMail = (mail: string) => {
    setAutomationBuilderFormValue(
      `${configFieldNamePrefix}.customMails`,
      (config?.customMails || []).filter((value: string) => value !== mail),
    );
  };

  const onChange = (
    e: KeyboardEvent<HTMLInputElement>,
    onChange: (...props: any[]) => void,
  ) => {
    const { value } = e.currentTarget;
    if (
      e.key === 'Enter' &&
      value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      onChange((config?.customMails || []).concat(value));
      e.currentTarget.value = '';
    }
  };

  return { onChange, removeMail, control, config };
};

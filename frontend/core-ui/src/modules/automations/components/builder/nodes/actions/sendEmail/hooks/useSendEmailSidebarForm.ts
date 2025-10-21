import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType } from '@/automations/types';
import { findTriggerForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardEvent } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import {
  sendEmailConfigFormSchema,
  TAutomationSendEmailConfig,
} from '../states/sendEmailConfigForm';

export const useSendEmailSidebarForm = (currentActionIndex: number) => {
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;
  const { control: automationBuilderFormControl } =
    useFormContext<TAutomationBuilderForm>();
  const [triggers = [], actions = [], config = {}] =
    useWatch<TAutomationBuilderForm>({
      control: automationBuilderFormControl,
      name: ['triggers', 'actions', `${configFieldNamePrefix}`],
    });
  const form = useForm<TAutomationSendEmailConfig>({
    resolver: zodResolver(sendEmailConfigFormSchema),
    defaultValues: {
      fromUserId: config?.fromUserId || '',
      fromEmailPlaceHolder: config?.fromEmailPlaceHolder || '',
      customMails: config?.customMails || [],
      attributionMails: config?.attributionMails || '',
      teamMember: config?.teamMember || [],
      customer: config?.customer || [],
      subject: config?.subject || '',
      emailTemplateId: config?.emailTemplateId || '',
      content: config?.content || '',
      type: config?.type || 'default',
    },
  });

  const contentType = findTriggerForAction(
    actions[currentActionIndex].id,
    actions,
    triggers,
  )?.type;

  return { form, contentType };
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

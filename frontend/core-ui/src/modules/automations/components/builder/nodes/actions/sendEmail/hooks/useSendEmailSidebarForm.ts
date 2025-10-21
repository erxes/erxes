import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType } from '@/automations/types';
import { findTriggerForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { KeyboardEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export const useSendEmailSidebarForm = (currentActionIndex: number) => {
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;

  const { control } = useFormContext<TAutomationBuilderForm>();
  const [triggers = [], actions = [], config = {}] =
    useWatch<TAutomationBuilderForm>({
      control,
      name: ['triggers', 'actions', `${configFieldNamePrefix}`],
    });

  const contentType = findTriggerForAction(
    actions[currentActionIndex].id,
    actions,
    triggers,
  )?.type;

  return { control, config, contentType };
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

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
} from 'ui-modules';
import { messageTriggerSchema } from '../schemas/messageTriggerSchema';
import { TMessageTriggerForm } from '../types/messageTrigger';

export const useMessageTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
  formRef,
}: Pick<
  AutomationTriggerFormProps<TMessageTriggerForm>,
  'activeTrigger' | 'onSaveTriggerConfig' | 'formRef'
>) => {
  const form = useForm<TMessageTriggerForm>({
    resolver: zodResolver(messageTriggerSchema),
    values: { ...((activeTrigger?.config || {}) as TMessageTriggerForm) },
  });

  const [activeConditionType, setActiveConditionType] = useState('');

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      form.handleSubmit(onSaveTriggerConfig, () =>
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        }),
      )();
    },
  });

  return {
    form,
    botId: form.watch('botId'),
    activeConditionType,
    setActiveConditionType,
  };
};

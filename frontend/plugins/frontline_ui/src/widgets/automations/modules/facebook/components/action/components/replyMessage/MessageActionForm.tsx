import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  AutomationActionFormProps,
  useAutomationRemoteActionFormSubmit,
} from 'ui-modules';
import { FacebookMessages } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/FacebookMessages';
import { MessageSequenceHeader } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/MessageSequenceHeader';
import { ReplyMessageProvider } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

import {
  replyMessageFormSchema,
  TMessageActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';

export const MessageActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps<TMessageActionForm>) => {
  const form = useForm<TMessageActionForm>({
    resolver: zodResolver(replyMessageFormSchema),
    defaultValues: { ...(currentAction?.config || {}) },
  });
  const { handleSubmit } = form;

  useAutomationRemoteActionFormSubmit({
    formRef,
    callback: () =>
      handleSubmit(onSaveActionConfig, () =>
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        }),
      )(),
  });

  useEffect(() => {
    if (currentAction?.config) {
      form.reset({ ...currentAction.config });
    }
  }, [currentAction?.config, form]);

  return (
    <ReplyMessageProvider form={form}>
      <div className="w-[670px] ">
        <MessageSequenceHeader />
        <FacebookMessages />
      </div>
    </ReplyMessageProvider>
  );
};

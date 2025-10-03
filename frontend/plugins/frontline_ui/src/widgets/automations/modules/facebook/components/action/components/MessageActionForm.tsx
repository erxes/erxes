import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { AutomationActionFormProps } from 'ui-modules';
import { FacebookMessages } from '~/widgets/automations/modules/facebook/components/action/components/FacebookMessages';
import { MessageSequenceHeader } from '~/widgets/automations/modules/facebook/components/action/components/MessageSequenceHeader';
import { ReplyMessageProvider } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import {
  replyMessageFormSchema,
  TMessageActionForm,
} from '../states/replyMessageActionForm';

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

  useImperativeHandle(formRef, () => ({
    submit: () => {
      handleSubmit(onSaveActionConfig, () => {
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        });
      })();
    },
  }));

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

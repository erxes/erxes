import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { AutomationTriggerFormProps } from 'ui-modules';
import { commentTriggerSchema } from '../schemas/commentTriggerSchema';
import { TCommentTriggerForm } from '../types/commentTrigger';

export const useCommentTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: Pick<
  AutomationTriggerFormProps<TCommentTriggerForm>,
  'formRef' | 'activeTrigger' | 'onSaveTriggerConfig'
>) => {
  const form = useForm<TCommentTriggerForm>({
    resolver: zodResolver(commentTriggerSchema),
    defaultValues: { postType: 'specific', ...(activeTrigger?.config || {}) },
  });

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveTriggerConfig, () =>
      toast({
        title: 'There is some error in the form',
        variant: 'destructive',
      }),
    ),
  }));

  const [botId, checkContent, postType] = form.watch([
    'botId',
    'checkContent',
    'postType',
  ]);

  return {
    form,
    botId,
    checkContent,
    postType,
  };
};

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useFormValidationErrorHandler,
} from 'ui-modules';
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
  const { t } = useTranslation('frontline');
  const form = useForm<TCommentTriggerForm>({
    resolver: zodResolver(commentTriggerSchema),
    defaultValues: { postType: 'specific', ...(activeTrigger?.config || {}) },
  });

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Trigger',
  });
  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveTriggerConfig, handleValidationErrors),
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

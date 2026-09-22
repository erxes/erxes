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
  const config = activeTrigger?.config || ({} as TCommentTriggerForm);
  // Only a brand new trigger takes the narrower default; injecting it into a
  // saved config would silently change what an existing automation answers.
  const isNew = !Object.keys(config).length;

  const form = useForm<TCommentTriggerForm>({
    resolver: zodResolver(commentTriggerSchema),
    defaultValues: {
      postType: 'specific',
      ...(isNew ? { onlyFirstLevel: true } : {}),
      ...config,
    },
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

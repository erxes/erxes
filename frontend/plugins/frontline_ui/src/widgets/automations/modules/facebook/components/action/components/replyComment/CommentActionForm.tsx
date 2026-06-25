import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Textarea, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AutomationActionFormProps } from 'ui-modules';
import { InputTextCounter } from '~/widgets/automations/modules/facebook/components/action/components/InputTextCounter';
import {
  commentActionFormSchema,
  TCommentActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyCommentActionForm';

export const CommentActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TCommentActionForm>({
    resolver: zodResolver(commentActionFormSchema),
    defaultValues: { ...(currentAction?.config || {}) },
  });
  const { control } = form;

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveActionConfig, () =>
      toast({
        title: t('form-error'),
        variant: 'destructive',
      }),
    ),
  }));

  return (
    <div className="w-xl p-4">
      <Form {...form}>
        <Form.Field
          control={control}
          name="text"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="flex flex-row justify-between ">
                <div className="flex flex-row gap-2 items-center">
                  {t('text')}
                  <InputTextCounter
                    count={field.value?.length || 0}
                    limit={8000}
                  />
                </div>
              </Form.Label>
              <Form.Control>
                <Textarea {...field} placeholder={t('enter-your-text')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="attachments"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('attachments-label')}</Form.Label>
              <Form.Control>
                <Button disabled variant="secondary">
                  {t('upload-attachments-wip')}
                </Button>
              </Form.Control>
            </Form.Item>
          )}
        />
      </Form>
    </div>
  );
};

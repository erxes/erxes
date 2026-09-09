import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Switch, Textarea, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AutomationActionFormProps } from 'ui-modules';
import { InputTextCounter } from '~/widgets/automations/modules/facebook/components/action/components/InputTextCounter';
import {
  commentActionFormSchema,
  TCommentActionForm,
  toCommentActionFormValues,
} from '~/widgets/automations/modules/facebook/components/action/states/replyCommentActionForm';

export const CommentActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps) => {
  const { t } = useTranslation('frontline');
  const form = useForm<TCommentActionForm>({
    resolver: zodResolver(commentActionFormSchema),
    defaultValues: toCommentActionFormValues(currentAction?.config),
  });
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    // A string array has no id of its own, so react-hook-form keys it for us.
    name: 'texts' as never,
  });

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
        <Form.Item>
          <Form.Label>
            {t('reply-variants', { defaultValue: 'Reply variants' })}
          </Form.Label>
          <Form.Description>
            {t('reply-variants-description', {
              defaultValue:
                'One is picked at random for each comment, so the same sentence does not fill a post.',
            })}
          </Form.Description>
        </Form.Item>

        {fields.map((item, index) => (
          <Form.Field
            key={item.id}
            control={control}
            name={`texts.${index}`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-2">
                    {t('text')} {index + 1}
                    <InputTextCounter
                      count={field.value?.length || 0}
                      limit={8000}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      aria-label={t('remove', { defaultValue: 'Remove' })}
                      onClick={() => remove(index)}
                    >
                      <IconTrash />
                    </Button>
                  )}
                </Form.Label>
                <Form.Control>
                  <Textarea {...field} placeholder={t('enter-your-text')} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        ))}

        <Button
          variant="secondary"
          type="button"
          className="w-full"
          onClick={() => append('')}
        >
          <IconPlus />
          {t('add-reply-variant', { defaultValue: 'Add reply variant' })}
        </Button>

        {fields.length === 1 && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
            <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" />
            {t('single-reply-variant-warning', {
              defaultValue:
                'With one variant every reply under a post is identical, which Meta treats as repetitive content. Add at least two more.',
            })}
          </p>
        )}

        <Form.Field
          control={control}
          name="mentionSender"
          render={({ field }) => (
            <Form.Item className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <Form.Label>
                  {t('mention-commenter', {
                    defaultValue: 'Mention the commenter',
                  })}
                </Form.Label>
                <Form.Description>
                  {t('mention-commenter-description', {
                    defaultValue:
                      'Tags the person by name at the start of the public reply.',
                  })}
                </Form.Description>
              </div>
              <Form.Control>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="attachments"
          render={() => (
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

import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Switch } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';

const buildMailReplySchema = (messageRequired: string) =>
  z.object({
    subject: z.string().optional().default(''),
    content: z.string().trim().min(1, messageRequired),
    shouldResolve: z.boolean().optional().default(false),
  });

export type TMailReplyActionForm = z.infer<
  ReturnType<typeof buildMailReplySchema>
>;

export type TMailReplyActionCopy = {
  formName: string;
  contentDescription: string;
  resolveDescription: string;
};

const readConfig = (config: unknown): TMailReplyActionForm => {
  const value = (config ?? {}) as Partial<TMailReplyActionForm>;

  return {
    subject: value.subject || '',
    content: value.content || '',
    shouldResolve: Boolean(value.shouldResolve),
  };
};

export const MailReplyActionForm = ({
  currentAction,
  onSaveActionConfig,
  formRef,
  targetType,
  copy,
}: AutomationActionFormProps<TMailReplyActionForm> & {
  copy: TMailReplyActionCopy;
}) => {
  const { t } = useTranslation('frontline');

  const schema = useMemo(
    () =>
      buildMailReplySchema(
        t('mail-action-message-required', 'Message is required'),
      ),
    [t],
  );

  const form = useForm<TMailReplyActionForm>({
    resolver: zodResolver(schema),
    defaultValues: readConfig(currentAction?.config),
  });

  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: copy.formName,
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveActionConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    form.reset(readConfig(currentAction?.config));
  }, [form, currentAction?.config]);

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={control}
          name="subject"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('mail-action-subject', 'Subject (optional)')}
              </Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t(
                    'mail-action-subject-placeholder',
                    'Leave blank to reply with Re: and the original subject',
                  )}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="content"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('mail-action-message', 'Message')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value || ''}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Description>{copy.contentDescription}</Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="shouldResolve"
          render={({ field }) => (
            <Form.Item className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <Form.Label>
                  {t('mail-action-resolve', 'Resolve the conversation')}
                </Form.Label>
                <Form.Description>{copy.resolveDescription}</Form.Description>
              </div>
              <Form.Control>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};

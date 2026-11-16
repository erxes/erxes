import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';

const telegramMessageActionSchema = z.object({
  content: z.string().trim().min(1, 'Add the message text'),
});

export type TTelegramMessageActionForm = z.infer<
  typeof telegramMessageActionSchema
>;

/** Automation action config form for "Send Telegram Message". */
export const TelegramActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
  targetType,
}: AutomationActionFormProps<TTelegramMessageActionForm>) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'widgets.automations-telegram',
  });
  const form = useForm<TTelegramMessageActionForm>({
    resolver: zodResolver(telegramMessageActionSchema),
    defaultValues: { content: currentAction?.config?.content || '' },
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('action.form-name'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveActionConfig, handleValidationErrors)(),
  });

  // The sidebar reuses this form across action nodes without remounting
  useEffect(() => {
    form.reset({ content: currentAction?.config?.content || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAction?.config]);

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={control}
          name="content"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('action.message')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value || ''}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Description>
                {t('action.message-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};

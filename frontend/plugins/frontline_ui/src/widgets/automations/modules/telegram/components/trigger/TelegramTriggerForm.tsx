import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';

const telegramTriggerSchema = z.object({
  keywords: z.string().optional().default(''),
  // Groups are opt-in: a bot answering every group message turns into spam
  chatTypes: z.enum(['private', 'all']).default('private'),
});

export type TTelegramTriggerForm = z.infer<typeof telegramTriggerSchema>;

const defaultsFromConfig = (
  config?: Partial<TTelegramTriggerForm> | null,
): TTelegramTriggerForm => ({
  keywords: config?.keywords || '',
  chatTypes: config?.chatTypes === 'all' ? 'all' : 'private',
});

/** Automation trigger config form for incoming Telegram messages. */
export const TelegramTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
  formRef,
}: AutomationTriggerFormProps<TTelegramTriggerForm>) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'widgets.automations-telegram',
  });
  const form = useForm<TTelegramTriggerForm>({
    resolver: zodResolver(telegramTriggerSchema),
    defaultValues: defaultsFromConfig(activeTrigger?.config),
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('trigger.form-name'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  // The sidebar reuses this form across trigger nodes without remounting
  useEffect(() => {
    form.reset(defaultsFromConfig(activeTrigger?.config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrigger?.config]);

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={control}
          name="chatTypes"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('trigger.chats')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="private">
                    {t('trigger.chats-private')}
                  </Select.Item>
                  <Select.Item value="all">{t('trigger.chats-all')}</Select.Item>
                </Select.Content>
              </Select>
              <Form.Description>
                {t('trigger.chats-description')}
              </Form.Description>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="keywords"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('trigger.keywords')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t('trigger.keywords-placeholder')}
                />
              </Form.Control>
              <Form.Description>
                {t('trigger.keywords-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};

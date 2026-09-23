import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Switch } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';
import { MailInboxChecklist } from './MailInboxChecklist';

const mailTriggerSchema = z.object({
  integrationIds: z.array(z.string()).optional().default([]),
  fromAddresses: z.string().optional().default(''),
  subjectKeywords: z.string().optional().default(''),
  keywords: z.string().optional().default(''),
  includeUnverifiedSenders: z.boolean().optional().default(false),
});

export type TMailTriggerForm = z.infer<typeof mailTriggerSchema>;

type TMailTextFilter = 'fromAddresses' | 'subjectKeywords' | 'keywords';

const readConfig = (config: unknown): TMailTriggerForm => {
  const value = (config ?? {}) as Partial<TMailTriggerForm>;

  return {
    integrationIds: Array.isArray(value.integrationIds)
      ? value.integrationIds
      : [],
    fromAddresses: value.fromAddresses || '',
    subjectKeywords: value.subjectKeywords || '',
    keywords: value.keywords || '',
    includeUnverifiedSenders: Boolean(value.includeUnverifiedSenders),
  };
};

export const MailTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
  formRef,
}: AutomationTriggerFormProps<TMailTriggerForm>) => {
  const { t } = useTranslation('frontline');

  const form = useForm<TMailTriggerForm>({
    resolver: zodResolver(mailTriggerSchema),
    defaultValues: readConfig(activeTrigger?.config),
  });

  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: t('mail-trigger-form-name', 'Email Received Trigger'),
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  useEffect(() => {
    form.reset(readConfig(activeTrigger?.config));
  }, [form, activeTrigger?.config]);

  const textFilters: {
    name: TMailTextFilter;
    label: string;
    placeholder: string;
    description: string;
  }[] = [
    {
      name: 'fromAddresses',
      label: t('mail-trigger-sender', 'Sender filter (optional)'),
      placeholder: t(
        'mail-trigger-sender-placeholder',
        'e.g. ceo@acme.com — leave blank for any sender',
      ),
      description: t(
        'mail-trigger-sender-description',
        'Only enroll when the email comes from one of these comma-separated addresses.',
      ),
    },
    {
      name: 'subjectKeywords',
      label: t('mail-trigger-subject', 'Subject filter (optional)'),
      placeholder: t(
        'mail-trigger-subject-placeholder',
        'e.g. invoice, refund — leave blank for any subject',
      ),
      description: t(
        'mail-trigger-subject-description',
        'Only enroll when the subject contains one of these comma-separated keywords.',
      ),
    },
    {
      name: 'keywords',
      label: t('mail-trigger-body', 'Body filter (optional)'),
      placeholder: t(
        'mail-trigger-body-placeholder',
        'e.g. urgent, cancel — leave blank for any body',
      ),
      description: t(
        'mail-trigger-body-description',
        'Only enroll when the new text of the email, without the quoted earlier messages, contains one of these comma-separated keywords. Every filter you set must match.',
      ),
    },
  ];

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <Form.Field
          control={control}
          name="integrationIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('mail-trigger-inboxes', 'Inboxes (optional)')}
              </Form.Label>
              <Form.Control>
                <MailInboxChecklist
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              </Form.Control>
              <Form.Description>
                {t(
                  'mail-trigger-inboxes-description',
                  'Only enroll mail that arrives in the checked inboxes. Leave every inbox unchecked to cover all of them.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        {textFilters.map((filter) => (
          <Form.Field
            key={filter.name}
            control={control}
            name={filter.name}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{filter.label}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={filter.placeholder}
                  />
                </Form.Control>
                <Form.Description>{filter.description}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        ))}

        <Form.Field
          control={control}
          name="includeUnverifiedSenders"
          render={({ field }) => (
            <Form.Item className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <Form.Label>
                  {t('mail-trigger-unverified', 'Include unverified senders')}
                </Form.Label>
                <Form.Description>
                  {t(
                    'mail-trigger-unverified-description',
                    'Mail whose envelope sender does not match its From address is skipped unless this is on. Send Email never answers such mail; Draft Email Reply leaves it for a teammate to review.',
                  )}
                </Form.Description>
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

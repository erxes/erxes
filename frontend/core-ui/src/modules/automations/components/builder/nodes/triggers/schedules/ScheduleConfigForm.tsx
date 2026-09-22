import { AutomationTriggerSidebarCoreFormProps } from '@/automations/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const cronExpressionPattern = /^(\S+\s+){4,6}\S+$/;

const createScheduleConfigSchema = (
  cronRequired: string,
  cronFormat: string,
  timezoneRequired: string,
) =>
  z.object({
    cron: z
      .string()
      .trim()
      .min(1, cronRequired)
      .regex(cronExpressionPattern, cronFormat),
    timezone: z.string().trim().min(1, timezoneRequired),
  });

interface ScheduleConfig {
  cron: string;
  timezone: string;
}

export const ScheduleConfigForm = ({
  formRef,
  handleSave,
  activeNode,
}: AutomationTriggerSidebarCoreFormProps) => {
  const { t } = useTranslation('automations');
  const form = useForm<ScheduleConfig>({
    resolver: zodResolver(
      createScheduleConfigSchema(
        t('schedule-cron-required'),
        t('schedule-cron-format-error'),
        t('schedule-timezone-required'),
      ),
    ),
    defaultValues: {
      cron: activeNode?.config?.cron || '0 9 * * *',
      timezone: activeNode?.config?.timezone || 'UTC',
    },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, () => {
        toast({
          title: t('schedule-validation-title'),
          description: t('schedule-validation-description'),
          variant: 'destructive',
        });
      })(),
  }));

  return (
    <FormProvider {...form}>
      <div className="space-y-5">
        <Form.Field
          control={form.control}
          name="cron"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('schedule-cron-label')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  className="font-mono"
                  placeholder="0 9 * * *"
                />
              </Form.Control>
              <Form.Description>
                {t('schedule-cron-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('schedule-timezone-label')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Asia/Ulaanbaatar" />
              </Form.Control>
              <Form.Description>
                {t('schedule-timezone-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </FormProvider>
  );
};

import { AutomationTriggerSidebarCoreFormProps } from '@/automations/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const CRON_EXPRESSION_PATTERN = /^(\S+\s+){4,6}\S+$/;
const DEFAULT_CRON = '0 9 * * *';
const DEFAULT_TIMEZONE = 'UTC';

type TScheduleConfig = {
  cron: string;
  timezone: string;
};

const scheduleConfigSchemaOf = (messages: {
  cronRequired: string;
  cronFormat: string;
  timezoneRequired: string;
}) =>
  z.object({
    cron: z
      .string()
      .trim()
      .min(1, messages.cronRequired)
      .regex(CRON_EXPRESSION_PATTERN, messages.cronFormat),
    timezone: z.string().trim().min(1, messages.timezoneRequired),
  });

/**
 * The schedule trigger's form: a cron and its timezone, submitted by the
 * sidebar through the form ref.
 */
export const useScheduleConfigForm = ({
  formRef,
  handleSave,
  activeNode,
}: AutomationTriggerSidebarCoreFormProps) => {
  const { t } = useTranslation('automations');
  const form = useForm<TScheduleConfig>({
    resolver: zodResolver(
      scheduleConfigSchemaOf({
        cronRequired: t('schedule-cron-required'),
        cronFormat: t('schedule-cron-format-error'),
        timezoneRequired: t('schedule-timezone-required'),
      }),
    ),
    defaultValues: {
      cron: activeNode?.config?.cron || DEFAULT_CRON,
      timezone: activeNode?.config?.timezone || DEFAULT_TIMEZONE,
    },
  });

  useImperativeHandle(formRef, () => ({
    submit: () =>
      form.handleSubmit(handleSave, () =>
        toast({
          title: t('schedule-validation-title'),
          description: t('schedule-validation-description'),
          variant: 'destructive',
        }),
      )(),
  }));

  return form;
};

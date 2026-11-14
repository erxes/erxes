import { useScheduleConfigForm } from '@/automations/components/builder/nodes/triggers/schedules/hooks/useScheduleConfigForm';
import { AutomationTriggerSidebarCoreFormProps } from '@/automations/types';
import { Form, Input } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const ScheduleConfigForm = ({
  formRef,
  handleSave,
  activeNode,
}: AutomationTriggerSidebarCoreFormProps) => {
  const { t } = useTranslation('automations');
  const form = useScheduleConfigForm({ formRef, handleSave, activeNode });

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

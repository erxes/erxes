import { Card, Form, Input, Select } from 'erxes-ui';
import { TAutomationActionProps } from 'ui-modules';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { FormProvider } from 'react-hook-form';
import { useDelay } from '@/automations/components/builder/nodes/actions/delay/hooks/useDelay';
import { useTranslation } from 'react-i18next';

export const DelayConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps) => {
  const {
    form,
    control,
    handleValueChange,
    handleIntervalChange,
    handleSubmit,
  } = useDelay(currentAction?.config || {});
  const { t } = useTranslation('automations');
  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Card.Content className="flex space-x-4">
          <Form.Field
            name="value"
            control={control}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label>{t('wait-for')}</Form.Label>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => handleValueChange(e, field.onChange)}
                />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="type"
            control={control}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label>{t('time-unit')}</Form.Label>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    handleIntervalChange(value, field.onChange)
                  }
                >
                  <Select.Trigger id="time-unit" className="mt-1">
                    <Select.Value placeholder={t('select-unit')} />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="minute">{t('minutes')}</Select.Item>
                    <Select.Item value="hour">{t('hours')}</Select.Item>
                    <Select.Item value="day">{t('days')}</Select.Item>
                    <Select.Item value="month">{t('month')}</Select.Item>
                    <Select.Item value="year">{t('year')}</Select.Item>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Card.Content>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};

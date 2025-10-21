import { Card, Form, Input, Select } from 'erxes-ui';
import { TAutomationActionProps } from 'ui-modules';
import { AutomationCoreConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { FormProvider } from 'react-hook-form';
import { useDelay } from '@/automations/components/builder/nodes/actions/delay/hooks/useDelay';

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
  return (
    <FormProvider {...form}>
      <AutomationCoreConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Card.Content className="flex space-x-4">
          <Form.Field
            name="value"
            control={control}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label>Wait for</Form.Label>
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
                <Form.Label>Time unit</Form.Label>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    handleIntervalChange(value, field.onChange)
                  }
                >
                  <Select.Trigger id="time-unit" className="mt-1">
                    <Select.Value placeholder="Select unit" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="minute">Minutes</Select.Item>
                    <Select.Item value="hour">Hours</Select.Item>
                    <Select.Item value="day">Days</Select.Item>
                    <Select.Item value="month">Month</Select.Item>
                    <Select.Item value="year">Year</Select.Item>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Card.Content>
      </AutomationCoreConfigFormWrapper>
    </FormProvider>
  );
};

import { Card, Form, Input, Select } from 'erxes-ui';
import { IActionProps } from 'ui-modules';
import { useDelay } from '../hooks/useDelay';

const SideBarContent = ({ currentActionIndex }: IActionProps) => {
  const { control, handleValueChange, handleIntervalChange, configField } =
    useDelay(currentActionIndex);
  return (
    <Card.Content className="flex flex-row gap-4 w-96 pt-6">
      <Form.Field
        name={`${configField}.value`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1">
            <Form.Label>Wait for</Form.Label>
            <Input
              {...field}
              type="number"
              onChange={(e) => handleValueChange(e, field.onChange)}
            />
          </Form.Item>
        )}
      />

      <Form.Field
        name={`${configField}.type`}
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
          </Form.Item>
        )}
      />
    </Card.Content>
  );
};

const NodeContent = ({ config }: any) => {
  const { value, type } = config || {};
  return (
    <div className="flex justify-between text-slate-600 text-xs">
      <span className="font-mono">Wait for:</span>
      <span className="font-mono">{`${value} ${type}s`}</span>
    </div>
  );
};

export const Delay = {
  SideBarContent,
  NodeContent,
};

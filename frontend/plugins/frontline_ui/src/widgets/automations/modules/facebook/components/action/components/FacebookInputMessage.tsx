import { cn, Form, Input, Select, Textarea } from 'erxes-ui';
import { FacebookMessageProps } from '../types/messageActionForm';
import { InputTextCounter } from './InputTextCounter';
import { ChangeEvent } from 'react';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

export const FacebookInputMessage = ({
  index,
  message,
  handleMessageChange,
}: FacebookMessageProps) => {
  const { control } = useReplyMessageAction();

  const { value, type } = message?.input || {};

  const handleValueChange = (
    e: ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
  ) => {
    let { value } = e.currentTarget;
    let intervalType: 'minute' | 'hour' | 'day' | 'month' | 'year' | undefined;

    const numericValue = Number(value);
    const set = (newValue: string, newType: typeof intervalType) => {
      value = newValue;
      intervalType = newType;
    };

    if (numericValue < 0) {
      // Negative is invalid, downgrade
      if (type === 'hour') set('1', 'minute');
      else if (type === 'day') set('1', 'hour');
      else if (type === 'month') set('1', 'day');
      else if (type === 'year') set('1', 'month');
      else set('1', 'minute');
    } else if (numericValue === 0) {
      // Keep 0 if you consider it valid
      set('0', type);
    } else {
      // Overflow handling
      if (type === 'minute' && numericValue >= 60) set('1', 'hour');
      else if (type === 'hour' && numericValue >= 24) set('1', 'day');
      else if (type === 'day' && numericValue >= 31) set('1', 'month');
      else if (type === 'month' && numericValue >= 12) set('1', 'year');
    }

    if (intervalType) {
      handleMessageChange(index, 'input.type', intervalType);
    }

    onChange(value);
  };

  const handleIntervalChange = (
    type: string,
    onChange: (...event: any[]) => void,
  ) => {
    const maxValues: Record<string, number> = {
      minute: 59,
      hour: 23,
      day: 30,
      month: 11,
      year: Infinity,
    };

    const numericValue = Number(value);

    const max = maxValues[type] ?? Infinity;

    if (numericValue > max) {
      handleMessageChange(index, 'input.value', '1');
    }

    onChange(type);
  };

  return (
    <>
      <Form.Field
        control={control}
        name={`messages.${index}.input.text`}
        render={({ field, fieldState }) => (
          <Form.Item>
            <Form.Label className="flex flex-row justify-between">
              Text
              <InputTextCounter count={field.value?.length || 0} limit={2000} />
            </Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            {fieldState.error?.message && (
              <p className={cn('text-xs', 'text-destructive')}>
                {fieldState.error?.message}
              </p>
            )}
          </Form.Item>
        )}
      />
      <div className="flex flex-row gap-2">
        <Form.Field
          name={`messages.${index}.input.value`}
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item className="w-1/2">
              <Form.Label>Wait for</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  type="number"
                  onChange={(e) => handleValueChange(e, field.onChange)}
                />
              </Form.Control>
              {fieldState.error?.message && (
                <p className={cn('text-xs', 'text-destructive')}>
                  {fieldState.error?.message}
                </p>
              )}
            </Form.Item>
          )}
        />

        <Form.Field
          name={`messages.${index}.input.type`}
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item className="w-1/2">
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
              {fieldState.error?.message && (
                <p className={cn('text-xs', 'text-destructive')}>
                  {fieldState.error?.message}
                </p>
              )}
            </Form.Item>
          )}
        />
      </div>
    </>
  );
};

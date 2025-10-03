import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { ChangeEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export const useDelay = (currentActionIndex: number) => {
  const configField: `actions.${number}.config` = `actions.${currentActionIndex}.config`;
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();

  const { value, type } =
    useWatch<TAutomationBuilderForm>({ control, name: configField }) || {};

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
      setValue(`${configField}.type`, intervalType);
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
      setValue(`${configField}.value`, '1');
    }

    onChange(type);
  };

  return { control, configField, handleValueChange, handleIntervalChange };
};

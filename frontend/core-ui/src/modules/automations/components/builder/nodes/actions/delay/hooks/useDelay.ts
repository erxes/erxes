import {
  delayConfigFormSchema,
  TDelayConfigForm,
} from '@/automations/components/builder/nodes/actions/delay/states/delayConfigForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export const useDelay = (config: TDelayConfigForm) => {
  const form = useForm<TDelayConfigForm>({
    resolver: zodResolver(delayConfigFormSchema),
    defaultValues: { ...config },
  });
  const { control, setValue, handleSubmit } = form;

  const { value, type } =
    useWatch<TDelayConfigForm>({
      control,
    }) || {};

  const handleValueChange = (
    e: ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
  ) => {
    let { value } = e.currentTarget;
    let intervalType: TDelayConfigForm['type'];

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
      setValue('type', intervalType);
    }

    console.log({ value: typeof value });
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
      setValue('value', '1');
    }

    onChange(type);
  };

  return {
    form,
    control,
    handleValueChange,
    handleIntervalChange,
    handleSubmit,
  };
};

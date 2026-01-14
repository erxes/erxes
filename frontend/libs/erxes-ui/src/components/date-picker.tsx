import { DateRange } from 'react-day-picker';
import { Calendar, CalendarProps } from './calendar';

import { Combobox } from './combobox';
import { Popover } from './popover';
import React from 'react';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';

export type DatePickerProps = {
  value: Date | Date[] | DateRange | undefined;
  onChange: (date: Date | Date[] | DateRange | undefined) => void;
  placeholder?: string;
  withPresent?: boolean;
  mode?: 'single' | 'multiple' | 'range';
  format?: string;
  variant?: 'outline' | 'default' | 'ghost';
} & Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  withPresent = false,
  disabled,
  className,
  mode = 'single',
  format = 'MMM DD, YYYY',
  variant = 'outline',
  ...props
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const renderButtonContent = () => {
    if (value) {
      if (mode === 'single') {
        return dayjs(new Date(value as Date)).format(format);
      }

      if (mode === 'multiple' && Array.isArray(value)) {
        const selectedDays = value?.length;

        if (selectedDays) {
          return `${selectedDays} ${selectedDays > 1 ? 'Days' : 'Day'}`;
        }
      }

      if (mode === 'range') {
        const rangeValue = value as DateRange;
        if (rangeValue?.from) {
          if (rangeValue.to) {
            return `${dayjs(rangeValue.from).format(format)} - ${dayjs(
              rangeValue.to,
            ).format(format)}`;
          }
          return dayjs(rangeValue.from).format(format);
        }
      }
    }

    return placeholder;
  };

  const handleDateChange = (
    selectedDate: Date | Date[] | DateRange | undefined,
  ) => {
    if (!selectedDate) {
      return;
    }

    if (mode !== 'range') {
      setIsOpen(false);
    }

    if (mode === 'range') {
      const range = selectedDate as DateRange;
      if (range?.from && range?.to) {
        setIsOpen(false);
      }
    }

    onChange && onChange(selectedDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild={true}>
        <Combobox.Trigger
          variant={variant}
          disabled={Boolean(disabled)}
          className={cn(
            !value && 'text-accent-foreground',
            Boolean(disabled) && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {renderButtonContent()}
        </Combobox.Trigger>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0" align="start">
        <Calendar
          {...props}
          disabled={(date: Date) =>
            withPresent
              ? date > new Date() || date < new Date('1900-01-01')
              : Boolean(disabled)
          }
          mode={mode as any}
          selected={value as any}
          onSelect={handleDateChange as any}
        />
      </Popover.Content>
    </Popover>
  );
};

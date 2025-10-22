import { Calendar, CalendarProps } from './calendar';

import { Combobox } from './combobox';
import { Popover } from './popover';
import React from 'react';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';

type DatePickerProps = {
  value: Date | Date[] | undefined;
  onChange: (date: Date | Date[] | undefined) => void;
  placeholder?: string;
  withPresent?: boolean;
  mode?: 'single' | 'multiple';
  format?: string;
  variant?: 'outline' | 'default' | 'ghost';
} & CalendarProps;

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
    }

    return placeholder;
  };

  const handleDateChange = (selectedDate: Date | Date[] | undefined) => {
    if (!selectedDate) {
      return;
    }

    setIsOpen(false);
    onChange && onChange(selectedDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild={true}>
        <Combobox.Trigger
          variant={variant}
          disabled={Boolean(disabled)}
          className={cn(
            !value && 'text-muted-foreground',
            Boolean(disabled) && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {renderButtonContent()}
        </Combobox.Trigger>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0">
        <Calendar
          {...props}
          disabled={(date: Date) =>
            withPresent
              ? date > new Date() || date < new Date('1900-01-01')
              : Boolean(disabled)
          }
          mode={mode}
          selected={value as any}
          onSelect={handleDateChange}
        />
      </Popover.Content>
    </Popover>
  );
};

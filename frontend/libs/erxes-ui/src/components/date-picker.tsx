import { DateRange, Matcher } from 'react-day-picker';
import { Calendar, CalendarProps } from './calendar';

import { Button } from './button';
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
  minDate?: Date;
  maxDate?: Date;
  mode?: 'single' | 'multiple' | 'range';
  format?: string;
  formatMultiple?: (count: number) => string;
  variant?: 'outline' | 'default' | 'ghost';
  allowNull?: boolean;
  clearLabel?: string;
  calendarClassName?: string;
  popoverContentProps?: React.ComponentPropsWithoutRef<typeof Popover.Content>;
} & Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;

const defaultFormatMultiple = (count: number) =>
  `${count} ${count > 1 ? 'Days' : 'Day'}`;

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  withPresent = false,
  minDate,
  maxDate,
  disabled,
  className,
  mode = 'single',
  format = 'MMM DD, YYYY',
  formatMultiple = defaultFormatMultiple,
  variant = 'outline',
  allowNull = false,
  clearLabel = 'Clear',
  calendarClassName,
  popoverContentProps,
  ...props
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const minBound =
    minDate ?? (withPresent ? new Date('1900-01-01') : undefined);
  const maxBound = maxDate ?? (withPresent ? new Date() : undefined);

  const calendarDisabled: Matcher[] = [
    ...(disabled === undefined ? [] : [disabled].flat()),
    ...(minBound ? [{ before: minBound }] : []),
    ...(maxBound ? [{ after: maxBound }] : []),
  ];

  const renderButtonContent = () => {
    if (value) {
      if (mode === 'single') {
        return dayjs(new Date(value as Date)).format(format);
      }

      if (mode === 'multiple' && Array.isArray(value)) {
        const selectedDays = value?.length;

        if (selectedDays) {
          return formatMultiple(selectedDays);
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

    if (mode === 'single') {
      setIsOpen(false);
    }
    onChange?.(selectedDate);
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild={true}>
        <Combobox.Trigger
          variant={variant}
          disabled={disabled === true}
          className={cn(
            !value && 'text-accent-foreground',
            disabled === true && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {renderButtonContent()}
        </Combobox.Trigger>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        {...popoverContentProps}
        className={cn('w-auto p-0', popoverContentProps?.className)}
      >
        <Calendar
          {...props}
          disabled={calendarDisabled}
          mode={mode}
          selected={value as any}
          onSelect={handleDateChange as any}
          className={cn('text-foreground', calendarClassName)}
        />
        {allowNull && value && (
          <div className="border-t p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleClear}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};

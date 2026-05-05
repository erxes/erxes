import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Calendar, CalendarProps, Combobox, Popover, cn } from 'erxes-ui';
import { DateRange } from 'react-day-picker';
import React from 'react';
import dayjs from 'dayjs';

type Mode = 'single' | 'multiple';

type TourDatePickerProps = {
  value: Date | Date[] | DateRange | undefined;
  onChange: (date: Date | Date[] | DateRange | undefined) => void;
  placeholder?: string;
  withPresent?: boolean;
  mode?: 'single' | 'multiple' | 'range';
  format?: string;
  variant?: 'outline' | 'default' | 'ghost';
  isDisabled?: boolean;
} & Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;

const TourDatePicker = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  withPresent = false,
  disabled,
  className,
  mode = 'single',
  format = 'MMM DD, YYYY',
  variant = 'outline',
  isDisabled = false,
  ...props
}: TourDatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const renderButtonContent = () => {
    if (value) {
      if (mode === 'single') {
        return dayjs(new Date(value as Date)).format(format);
      }

      if (mode === 'multiple' && Array.isArray(value)) {
        const selectedDays = value.length;

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
      onChange?.(selectedDate);
      return;
    }

    if (mode === 'single') {
      setIsOpen(false);
    } else if (mode === 'range') {
      const range = selectedDate as DateRange;
      if (range?.from && range?.to) {
        setIsOpen(false);
      }
    }

    onChange?.(selectedDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild={true}>
        <Combobox.Trigger
          variant={variant}
          disabled={isDisabled}
          className={cn(
            !value && 'text-accent-foreground',
            isDisabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {renderButtonContent()}
        </Combobox.Trigger>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0" align="start">
        <Calendar
          {...props}
          disabled={(date: Date) => {
            if (withPresent) {
              return date > new Date() || date < new Date('1900-01-01');
            }
            if (typeof disabled === 'function') {
              return disabled(date);
            }
            return Boolean(disabled);
          }}
          mode={mode}
          selected={value as any}
          onSelect={handleDateChange as any}
        />
      </Popover.Content>
    </Popover>
  );
};

const toDate = (val: unknown): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Date) return val;

  const d = new Date(val as any);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const toDates = (val: unknown): Date[] | undefined => {
  if (!Array.isArray(val)) return undefined;

  return val.map((v) => toDate(v)).filter((d): d is Date => !!d);
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  mode?: Mode;
  disabled?: boolean;
  fromDate?: Date;
};

const isDateDisabled = (date: Date, fromDate?: Date) => {
  if (!fromDate) return false;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const min = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  return d < min;
};

export const RHFDatePicker = <T extends FieldValues>({
  control,
  name,
  mode = 'single',
  disabled = false,
  fromDate,
}: Props<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        if (mode === 'single') {
          return (
            <TourDatePicker
              mode="single"
              value={toDate(field.value)}
              isDisabled={disabled}
              disabled={(date: Date) =>
                !!disabled || isDateDisabled(date, fromDate)
              }
              onChange={(val) => field.onChange(val ?? undefined)}
            />
          );
        }

        return (
          <TourDatePicker
            mode="multiple"
            value={toDates(field.value)}
            isDisabled={disabled}
            disabled={(date: Date) =>
              !!disabled || isDateDisabled(date, fromDate)
            }
            onChange={(val) => field.onChange(val ?? undefined)}
          />
        );
      }}
    />
  );
};

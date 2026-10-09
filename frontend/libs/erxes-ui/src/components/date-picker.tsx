import { DateRange, Matcher } from 'react-day-picker';
import { Calendar, CalendarProps } from 'erxes-ui/components/calendar';
import { Button } from 'erxes-ui/components/button';
import { Popover } from 'erxes-ui/components/popover';
import React from 'react';
import { cn } from 'erxes-ui/lib/utils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type DatePickerProps = {
  value: Date | Date[] | DateRange | undefined;
  onChange: (date?: Date | Date[] | DateRange | undefined) => void;
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

const formatDateMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);

  const normalizedMonth =
    month.length === 2
      ? String(Math.min(Number(month), 12)).padStart(2, '0')
      : month;

  if (digits.length <= 6) {
    return `${year}-${normalizedMonth}`;
  }

  const day = digits.slice(6, 8);

  const maxDay = dayjs(
    `${year}-${normalizedMonth}-01`,
    'YYYY-MM-DD',
    true,
  ).daysInMonth();

  const normalizedDay =
    day.length === 2
      ? String(Math.min(Number(day), maxDay)).padStart(2, '0')
      : day;

  return `${year}-${normalizedMonth}-${normalizedDay}`;
};

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
  format = 'YYYY-MM-DD',
  formatMultiple = defaultFormatMultiple,
  variant = 'outline',
  allowNull = false,
  clearLabel = 'Clear',
  calendarClassName,
  popoverContentProps,
  ...props
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const maxInputLength = format.length;

  React.useEffect(() => {
    if (value && mode === 'single') {
      setInputValue(dayjs(value as Date).format(format));
    } else if (!value) {
      setInputValue('');
    }
  }, [value, format, mode]);

  const minBound =
    minDate ?? (withPresent ? new Date('1900-01-01') : undefined);
  const maxBound = maxDate ?? (withPresent ? new Date() : undefined);

  const calendarDisabled: Matcher[] = [
    ...(disabled === undefined ? [] : [disabled].flat()),
    ...(minBound ? [{ before: minBound }] : []),
    ...(maxBound ? [{ after: maxBound }] : []),
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedText =
      format === 'YYYY-MM-DD'
        ? formatDateMask(rawValue)
        : rawValue.slice(0, maxInputLength);
    setInputValue(formattedText);
    if (mode !== 'single') return;
    if (!formattedText && allowNull) {
      onChange();
      return;
    }
    if (formattedText.length !== maxInputLength) return;
    const parsedDate = dayjs(formattedText, format, true);
    if (!parsedDate.isValid()) return;
    const isOutOfRange =
      (minBound && parsedDate.isBefore(dayjs(minBound), 'day')) ||
      (maxBound && parsedDate.isAfter(dayjs(maxBound), 'day'));
    if (isOutOfRange) return;
    onChange(parsedDate.toDate());
  };

  const handleDateChange = (
    selectedDate: Date | Date[] | DateRange | undefined,
  ) => {
    if (!selectedDate) {
      return;
    }

    if (
      mode !== 'range' ||
      (mode === 'range' && (selectedDate as DateRange)?.to)
    ) {
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
    setInputValue('');
    onChange();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative inline-block w-full">
        {mode === 'single' ? (
          <Popover.Trigger asChild>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              maxLength={maxInputLength}
              placeholder={placeholder}
              disabled={disabled === true}
              onBlur={() => {
                if (inputValue === '' && allowNull) return;

                const parsedDate = dayjs(inputValue, format, true);
                const isWithinBounds =
                  parsedDate.isValid() &&
                  !(minBound && parsedDate.isBefore(dayjs(minBound), 'day')) &&
                  !(maxBound && parsedDate.isAfter(dayjs(maxBound), 'day'));

                if (!isWithinBounds) {
                  setInputValue(
                    value && mode === 'single'
                      ? dayjs(value as Date).format(format)
                      : '',
                  );
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(true);
                }
              }}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className,
              )}
            />
          </Popover.Trigger>
        ) : (
          <Popover.Trigger asChild>
            <Button
              variant={variant}
              disabled={disabled === true}
              className={cn(
                'w-full justify-start text-left font-normal',
                className,
              )}
            >
              {renderButtonContent(
                value,
                mode,
                format,
                formatMultiple,
                placeholder,
              )}
            </Button>
          </Popover.Trigger>
        )}
      </div>
      <Popover.Content
        align="start"
        {...popoverContentProps}
        className={cn('w-auto p-0', popoverContentProps?.className)}
      >
        <Calendar
          {...({
            ...props,
            disabled: calendarDisabled,
            mode,
            selected: value,
            onSelect: handleDateChange,
            className: cn('text-foreground', calendarClassName),
          } as React.ComponentProps<typeof Calendar>)}
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

function renderButtonContent(
  value: Date | Date[] | DateRange | undefined,
  mode: string,
  format: string,
  formatMultiple: (count: number) => string,
  placeholder: string,
) {
  if (value) {
    if (mode === 'multiple' && Array.isArray(value) && value.length) {
      return formatMultiple(value.length);
    }
    if (mode === 'range') {
      const rangeValue = value as DateRange;
      if (rangeValue?.from) {
        return rangeValue.to
          ? `${dayjs(rangeValue.from).format(format)} - ${dayjs(
              rangeValue.to,
            ).format(format)}`
          : dayjs(rangeValue.from).format(format);
      }
    }
  }
  return placeholder;
}

import { IconCalendar, IconX } from '@tabler/icons-react';
import { DateRange, Matcher, dateMatchModifiers } from 'react-day-picker';
import { Calendar, CalendarProps } from 'erxes-ui/components/calendar';
import { Button } from 'erxes-ui/components/button';
import { Popover } from 'erxes-ui/components/popover';
import React from 'react';
import { cn } from 'erxes-ui/lib/utils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type DateInput = Date | string | number;

/**
 * Accepts what forms and APIs actually hold: Date objects, ISO strings,
 * timestamps, arrays of those, or a `{ from, to }` range of those.
 */
export type DatePickerValue =
  | DateInput
  | DateInput[]
  | DateRange
  | { from?: DateInput | null; to?: DateInput | null }
  | null
  | undefined;

export type DatePickerProps = {
  value?: DatePickerValue;
  /** Receives `null` when the value is cleared. */
  onChange: (date?: Date | Date[] | DateRange | null) => void;
  placeholder?: string;
  withPresent?: boolean;
  minDate?: Date;
  maxDate?: Date;
  mode?: 'single' | 'multiple' | 'range';
  format?: string;
  displayFormat?: string;
  formatMultiple?: (count: number) => string;
  variant?: 'outline' | 'default' | 'ghost';
  allowNull?: boolean;
  /** Shows an inline clear button in single mode; defaults to `allowNull`. */
  clearable?: boolean;
  clearLabel?: string;
  calendarClassName?: string;
  popoverContentProps?: React.ComponentPropsWithoutRef<typeof Popover.Content>;
} & Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;

const DEFAULT_FORMAT = 'YYYY-MM-DD';
const DEFAULT_DISPLAY_FORMAT = 'MMM D, YYYY';

const toDate = (value: unknown): Date | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  if (
    !(value instanceof Date) &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    return undefined;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

type NormalizedValue = Date | Date[] | DateRange | undefined;

const normalizeValue = (
  value: DatePickerValue,
  mode: 'single' | 'multiple' | 'range',
): NormalizedValue => {
  if (mode === 'multiple') {
    if (!Array.isArray(value)) return undefined;
    return value.map(toDate).filter((date): date is Date => Boolean(date));
  }

  if (mode === 'range') {
    if (!value || typeof value !== 'object' || value instanceof Date) {
      return undefined;
    }
    if (Array.isArray(value)) return undefined;
    const from = toDate(value.from);
    return from ? { from, to: toDate(value.to) } : undefined;
  }

  return toDate(value);
};

const getAnchorDate = (value: NormalizedValue) => {
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value[0];
  return value?.from;
};

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

const isWithinBounds = (date: dayjs.Dayjs, minBound?: Date, maxBound?: Date) =>
  date.isValid() &&
  !(minBound && date.isBefore(dayjs(minBound), 'day')) &&
  !(maxBound && date.isAfter(dayjs(maxBound), 'day'));

// Only the default format is masked; other formats (e.g. `MMM D, YYYY`) vary
// in length, so their text is left as typed and validated by strict parsing.
const maskInputText = (rawValue: string, format: string) =>
  format === DEFAULT_FORMAT ? formatDateMask(rawValue) : rawValue;

const getSingleDate = (
  value: NormalizedValue,
  mode: 'single' | 'multiple' | 'range',
) => (mode === 'single' && value instanceof Date ? value : undefined);

const getDateBounds = (
  withPresent: boolean,
  minDate?: Date,
  maxDate?: Date,
) => ({
  minBound: minDate ?? (withPresent ? new Date('1900-01-01') : undefined),
  maxBound: maxDate ?? (withPresent ? new Date() : undefined),
});

const getCalendarDisabled = (
  disabled: DatePickerProps['disabled'],
  minBound?: Date,
  maxBound?: Date,
): Matcher[] => [
  ...(disabled === undefined ? [] : [disabled].flat()),
  ...(minBound ? [{ before: minBound }] : []),
  ...(maxBound ? [{ after: maxBound }] : []),
];

/** Returns the typed date once it is complete, valid and within bounds. */
const parseInputDate = (
  text: string,
  format: string,
  minBound?: Date,
  maxBound?: Date,
) => {
  const parsedDate = dayjs(text, format, true);
  return isWithinBounds(parsedDate, minBound, maxBound)
    ? parsedDate.toDate()
    : undefined;
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
  format = DEFAULT_FORMAT,
  displayFormat = format === DEFAULT_FORMAT ? DEFAULT_DISPLAY_FORMAT : format,
  formatMultiple = defaultFormatMultiple,
  variant = 'outline',
  allowNull = false,
  clearable = allowNull,
  clearLabel = 'Clear',
  calendarClassName,
  popoverContentProps,
  defaultMonth,
  ...props
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const normalizedValue = normalizeValue(value, mode);
  const singleDate = getSingleDate(normalizedValue, mode);
  const singleTime = singleDate?.getTime();
  const formatSingle = (outputFormat = format) =>
    singleDate ? dayjs(singleDate).format(outputFormat) : '';

  // Keyed on the timestamp so a parent re-creating the same Date each render
  // does not wipe what the user is typing.
  React.useEffect(() => {
    setInputValue(
      singleTime === undefined ? '' : dayjs(singleTime).format(format),
    );
  }, [singleTime, format]);

  const { minBound, maxBound } = getDateBounds(withPresent, minDate, maxDate);
  const calendarDisabled = getCalendarDisabled(disabled, minBound, maxBound);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedText = maskInputText(e.target.value, format);
    setInputValue(formattedText);
    if (mode !== 'single') return;
    if (!formattedText) {
      if (allowNull && singleDate) onChange(null);
      return;
    }
    const parsedDate = parseInputDate(
      formattedText,
      format,
      minBound,
      maxBound,
    );
    if (parsedDate && !dateMatchModifiers(parsedDate, calendarDisabled)) {
      onChange(parsedDate);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsedDate = dayjs(inputValue, format, true);
    if (
      !isWithinBounds(parsedDate, minBound, maxBound) ||
      dateMatchModifiers(parsedDate.toDate(), calendarDisabled)
    ) {
      setInputValue(formatSingle());
    }
  };

  const handleDateChange = (
    selectedDate: Date | Date[] | DateRange | undefined,
  ) => {
    if (!selectedDate) return;
    // A range stays open until both ends are picked.
    if (mode !== 'range' || (selectedDate as DateRange).to) {
      setIsOpen(false);
    }
    onChange(selectedDate);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setIsOpen(false);
    // A parent that rejects null keeps its value; the focused empty input lets
    // the user type a replacement and restores the old date on blur.
    if (mode === 'single') inputRef.current?.focus();
  };

  const isDisabled = disabled === true;
  const showDisplayValue = !isFocused && Boolean(singleDate);
  const canClear = clearable && !isDisabled && Boolean(singleDate);
  const inputText = showDisplayValue ? formatSingle(displayFormat) : inputValue;

  const handleOpenChange = (open: boolean) => {
    if (open && isDisabled) return;
    setIsOpen(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="relative inline-block w-full">
        {mode === 'single' ? (
          <Popover.Trigger asChild>
            <div
              aria-disabled={isDisabled}
              className={cn(
                'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                isDisabled && 'cursor-not-allowed opacity-50',
                className,
              )}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isDisabled}
                onFocus={() => setIsFocused(true)}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                  }
                }}
                className="h-full w-full min-w-0 flex-1 bg-transparent p-0 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
              />
              {canClear ? (
                <button
                  type="button"
                  aria-label={clearLabel}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <IconX className="size-4" />
                </button>
              ) : (
                <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
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
                normalizedValue,
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
            selected: normalizedValue,
            onSelect: handleDateChange,
            defaultMonth:
              toDate(defaultMonth) ?? getAnchorDate(normalizedValue),
            className: cn('text-foreground', calendarClassName),
          } as React.ComponentProps<typeof Calendar>)}
        />
        {allowNull && normalizedValue && mode !== 'single' && (
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
  value: NormalizedValue,
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

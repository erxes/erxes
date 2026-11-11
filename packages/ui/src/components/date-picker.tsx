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

export type DatePickerValue =
  | DateInput
  | DateInput[]
  | DateRange
  | { from?: DateInput | null; to?: DateInput | null }
  | null
  | undefined;

export type DatePickerProps = {
  value?: DatePickerValue;
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
  clearable?: boolean;
  clearLabel?: string;
  calendarClassName?: string;
  popoverContentProps?: React.ComponentPropsWithoutRef<typeof Popover.Content>;
  inline?: boolean;
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

const DATE_SEGMENT_LENGTHS = [4, 2, 2];
const DATE_SEPARATOR = /[-./]/;
const LOOSE_INPUT_FORMATS = [
  DEFAULT_FORMAT,
  'YYYY-M-D',
  'YYYY-MM-D',
  'YYYY-M-DD',
];

const splitDateSegments = (value: string) => {
  const segments = [''];

  for (const char of value) {
    const index = segments.length - 1;
    const isLastSegment = index === DATE_SEGMENT_LENGTHS.length - 1;

    if (DATE_SEPARATOR.test(char)) {
      if (segments[index] && !isLastSegment) segments.push('');
    } else if (/\d/.test(char)) {
      if (segments[index].length < DATE_SEGMENT_LENGTHS[index]) {
        segments[index] += char;
      } else if (!isLastSegment) {
        segments.push(char);
      }
    }
  }

  return segments;
};

const formatDateMask = (value: string) => {
  const [year, month, day] = splitDateSegments(value);

  const normalizedMonth =
    month?.length === 2
      ? String(Math.min(Number(month), 12)).padStart(2, '0')
      : month;

  const maxDay = dayjs(
    `${year}-${normalizedMonth?.padStart(2, '0')}-01`,
    DEFAULT_FORMAT,
    true,
  ).daysInMonth();

  const normalizedDay =
    day?.length === 2 && maxDay
      ? String(Math.min(Number(day), maxDay)).padStart(2, '0')
      : day;

  return [year, normalizedMonth, normalizedDay]
    .filter((segment) => segment !== undefined)
    .join('-');
};

const isWithinBounds = (date: dayjs.Dayjs, minBound?: Date, maxBound?: Date) =>
  date.isValid() &&
  !(minBound && date.isBefore(dayjs(minBound), 'day')) &&
  !(maxBound && date.isAfter(dayjs(maxBound), 'day'));

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

const getInputFormats = (format: string) =>
  format === DEFAULT_FORMAT ? LOOSE_INPUT_FORMATS : [format];

const parseInputDate = (
  text: string,
  format: string | string[],
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
  allowNull,
  clearable = allowNull ?? true,
  clearLabel = 'Clear',
  calendarClassName,
  popoverContentProps,
  inline = false,
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

  React.useEffect(() => {
    setInputValue(
      singleTime === undefined ? '' : dayjs(singleTime).format(format),
    );
  }, [singleTime, format]);

  const hasValue = Boolean(getAnchorDate(normalizedValue));
  const { minBound, maxBound } = getDateBounds(withPresent, minDate, maxDate);
  const calendarDisabled = getCalendarDisabled(disabled, minBound, maxBound);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedText = maskInputText(e.target.value, format);
    setInputValue(formattedText);
    if (mode !== 'single') return;
    if (!formattedText) {
      if (clearable && singleDate) onChange(null);
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

  const parseTypedDate = () => {
    if (mode !== 'single' || !inputValue) return undefined;
    const parsedDate = parseInputDate(
      inputValue,
      getInputFormats(format),
      minBound,
      maxBound,
    );
    return parsedDate && !dateMatchModifiers(parsedDate, calendarDisabled)
      ? parsedDate
      : undefined;
  };

  const commitTypedDate = (date: Date) => {
    setInputValue(dayjs(date).format(format));
    if (date.getTime() !== singleTime) onChange(date);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsedDate = parseTypedDate();
    if (parsedDate) {
      commitTypedDate(parsedDate);
    } else {
      setInputValue(formatSingle());
    }
  };

  const handleDateChange = (
    selectedDate: Date | Date[] | DateRange | undefined,
  ) => {
    if (!selectedDate) return;
    if (mode !== 'range' || (selectedDate as DateRange).to) {
      setIsOpen(false);
    }
    onChange(selectedDate);
  };

  const handleClear = () => {
    setInputValue('');
    if (hasValue) onChange(null);
    setIsOpen(false);
    if (mode === 'single') inputRef.current?.focus();
  };

  const isDisabled = disabled === true;
  const showDisplayValue = !isFocused && Boolean(singleDate);
  const inputText = showDisplayValue ? formatSingle(displayFormat) : inputValue;
  const canClear = clearable && !isDisabled && Boolean(inputText);

  const handleOpenChange = (open: boolean) => {
    if (open && isDisabled) return;
    setIsOpen(open);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const opensPopover = !inline && (e.key === 'Enter' || e.key === ' ');
    if (!opensPopover && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    const typedDate = e.key === 'Enter' ? parseTypedDate() : undefined;
    if (typedDate && typedDate.getTime() !== singleTime) {
      commitTypedDate(typedDate);
      return;
    }
    if (opensPopover) setIsOpen(true);
  };

  const singleInput = (
    <div
      aria-disabled={isDisabled}
      className={cn(
        'flex h-7 w-full items-center gap-1 rounded-sm bg-background px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] focus-within:shadow-focus',
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
        onKeyDown={handleInputKeyDown}
        autoComplete="off"
        className="h-full w-full min-w-0 flex-1 bg-transparent p-0 placeholder:text-accent-foreground/70 focus-visible:outline-hidden disabled:cursor-not-allowed"
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
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-50 hover:bg-accent hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:shadow-focus"
        >
          <IconX className="size-4" />
        </button>
      ) : (
        <IconCalendar className="size-4 shrink-0 text-muted-foreground opacity-50" />
      )}
    </div>
  );

  const calendar = (
    <>
      <Calendar
        {...({
          ...props,
          disabled: calendarDisabled,
          mode,
          selected: normalizedValue,
          onSelect: handleDateChange,
          defaultMonth: toDate(defaultMonth) ?? getAnchorDate(normalizedValue),
          className: cn('text-foreground', calendarClassName),
        } as React.ComponentProps<typeof Calendar>)}
      />
      {clearable && !isDisabled && hasValue && mode !== 'single' && (
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
    </>
  );

  if (inline) {
    return (
      <div className="flex flex-col">
        {mode === 'single' && <div className="p-2 pb-0">{singleInput}</div>}
        {calendar}
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="relative inline-block w-full">
        <Popover.Trigger asChild>
          {mode === 'single' ? (
            singleInput
          ) : (
            <Button
              variant={variant}
              disabled={isDisabled}
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
          )}
        </Popover.Trigger>
      </div>
      <Popover.Content
        align="start"
        {...popoverContentProps}
        className={cn('w-auto p-0', popoverContentProps?.className)}
      >
        {calendar}
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

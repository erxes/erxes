import type { DateRange, Matcher, PropsBase } from 'react-day-picker';
import { useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Calendar } from './calendar';
import { Button } from './button';
import { Popover } from './popover';
import { cn } from '../lib/utils';
import type { DatePickerMode, DatePickerValue, NormalizedValue } from './date-picker-value';
import {
  DEFAULT_DISPLAY_FORMAT,
  DEFAULT_FORMAT,
  describeValue,
  getAnchorDate,
  getCalendarDisabled,
  getDateBounds,
  isDateRange,
  normalizeValue,
  toDate,
} from './date-picker-value';
import { DateTextInput } from './date-text-input';

type SelectedDates = Date | Date[] | DateRange;

export type DatePickerProps = {
  value?: DatePickerValue;
  onChange: (date?: SelectedDates | null) => void;
  placeholder?: string;
  withPresent?: boolean;
  minDate?: Date;
  maxDate?: Date;
  mode?: DatePickerMode;
  /** Day.js tokens, e.g. `YYYY-MM-DD`. */
  format?: string;
  /** Day.js tokens, e.g. `DD.MM.YYYY`. */
  displayFormat?: string;
  formatMultiple?: (count: number) => string;
  variant?: 'outline' | 'default' | 'ghost';
  allowNull?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  calendarClassName?: string;
  popoverContentProps?: ComponentPropsWithoutRef<typeof Popover.Content>;
  inline?: boolean;
  disabled?: Matcher | Matcher[];
} & Omit<PropsBase, 'mode' | 'required' | 'disabled'>;

const defaultFormatMultiple = (count: number) => `${count} ${count > 1 ? 'Days' : 'Day'}`;

type PickerCalendarProps = Omit<PropsBase, 'disabled'> & {
  mode: DatePickerMode;
  value: NormalizedValue;
  disabled: Matcher[];
  onSelect: (date: SelectedDates | undefined) => void;
  clearLabel?: string;
  onClear: () => void;
};

const ModeCalendar = ({
  mode,
  value,
  onSelect,
  ...props
}: Omit<PickerCalendarProps, 'clearLabel' | 'onClear'>) => {
  if (mode === 'range') {
    return (
      <Calendar
        {...props}
        mode="range"
        selected={isDateRange(value) ? value : undefined}
        onSelect={onSelect}
      />
    );
  }

  if (mode === 'multiple') {
    return (
      <Calendar
        {...props}
        mode="multiple"
        selected={Array.isArray(value) ? value : undefined}
        onSelect={onSelect}
      />
    );
  }

  return (
    <Calendar
      {...props}
      mode="single"
      selected={value instanceof Date ? value : undefined}
      onSelect={onSelect}
    />
  );
};

/** The calendar for the picker's mode, with a clear button when several dates can be picked. */
const PickerCalendar = ({ clearLabel, onClear, ...props }: PickerCalendarProps) => (
  <>
    <ModeCalendar {...props} />
    {clearLabel && (
      <div className="border-t p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onClear}
        >
          {clearLabel}
        </Button>
      </div>
    )}
  </>
);

const PickerPopover = ({
  open,
  onOpenChange,
  trigger,
  contentProps,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  contentProps: DatePickerProps['popoverContentProps'];
  children: ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    {/* The anchor is the wrapper: the single-date text input takes no ref, so as the
        trigger's child it left the calendar unpositioned, above the viewport. */}
    <Popover.Anchor asChild>
      <div className="relative inline-block w-full">
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      </div>
    </Popover.Anchor>
    <Popover.Content
      align="start"
      {...contentProps}
      className={cn('w-auto p-0', contentProps?.className)}
    >
      {children}
    </Popover.Content>
  </Popover>
);

/** Open state, the normalized value, bounds and the select and clear handlers. */
const useDatePicker = ({
  value,
  onChange,
  mode,
  withPresent,
  minDate,
  maxDate,
  disabled,
}: Pick<DatePickerProps, 'value' | 'onChange' | 'minDate' | 'maxDate' | 'disabled'> & {
  mode: DatePickerMode;
  withPresent: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedValue = normalizeValue(value, mode);
  const bounds = getDateBounds(withPresent, minDate, maxDate);
  const hasValue = Boolean(getAnchorDate(normalizedValue));

  return {
    isOpen,
    setIsOpen,
    inputRef,
    normalizedValue,
    bounds,
    calendarDisabled: getCalendarDisabled(disabled, bounds.minBound, bounds.maxBound),
    isDisabled: disabled === true,
    hasValue,
    handleSelect: (selected: SelectedDates | undefined) => {
      if (!selected) return;

      if (mode !== 'range' || (isDateRange(selected) && selected.to)) setIsOpen(false);
      onChange(selected);
    },
    handleClear: () => {
      if (hasValue) onChange(null);
      setIsOpen(false);

      if (mode === 'single') inputRef.current?.focus();
    },
  };
};

/** The props with their defaults; what is left goes to the calendar. */
const resolveProps = ({
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
  ...calendarProps
}: DatePickerProps) => ({
  value,
  onChange,
  placeholder,
  withPresent,
  minDate,
  maxDate,
  disabled,
  className,
  mode,
  format,
  displayFormat,
  formatMultiple,
  variant,
  clearable,
  clearLabel,
  calendarClassName,
  popoverContentProps,
  inline,
  defaultMonth,
  calendarProps,
});

export const DatePicker = (props: DatePickerProps) => {
  const { calendarProps, ...o } = resolveProps(props);
  const picker = useDatePicker(o);
  const { normalizedValue, isDisabled, hasValue, setIsOpen } = picker;

  const singleInput = (
    <DateTextInput
      singleDate={normalizedValue instanceof Date ? normalizedValue : undefined}
      onChange={o.onChange}
      format={o.format}
      displayFormat={o.displayFormat}
      bounds={picker.bounds}
      calendarDisabled={picker.calendarDisabled}
      clearable={o.clearable}
      clearLabel={o.clearLabel}
      isDisabled={isDisabled}
      placeholder={o.placeholder}
      className={o.className}
      inputRef={picker.inputRef}
      onClear={picker.handleClear}
      onOpen={o.inline ? undefined : () => setIsOpen(true)}
    />
  );

  const showClear = o.clearable && !isDisabled && hasValue && o.mode !== 'single';

  const calendar = (
    <PickerCalendar
      {...calendarProps}
      mode={o.mode}
      value={normalizedValue}
      disabled={picker.calendarDisabled}
      onSelect={picker.handleSelect}
      defaultMonth={toDate(o.defaultMonth) ?? getAnchorDate(normalizedValue)}
      className={cn('text-foreground', o.calendarClassName)}
      clearLabel={showClear ? o.clearLabel : undefined}
      onClear={picker.handleClear}
    />
  );

  if (o.inline) {
    return (
      <div className="flex flex-col">
        {o.mode === 'single' && <div className="p-2 pb-0">{singleInput}</div>}
        {calendar}
      </div>
    );
  }

  return (
    <PickerPopover
      open={picker.isOpen}
      onOpenChange={(open) => {
        if (!open || !isDisabled) setIsOpen(open);
      }}
      trigger={
        o.mode === 'single' ? (
          singleInput
        ) : (
          <Button
            variant={o.variant}
            disabled={isDisabled}
            className={cn('w-full justify-start text-left font-normal', o.className)}
          >
            {describeValue(normalizedValue, o.format, o.formatMultiple) ?? o.placeholder}
          </Button>
        )
      }
      contentProps={o.popoverContentProps}
    >
      {calendar}
    </PickerPopover>
  );
};

import type { Matcher, PropsBase } from 'react-day-picker';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Calendar } from './calendar';
import { Button } from './button';
import { Popover } from './popover';
import { useFormat } from '../lib/format';
import { cn } from '../lib/utils';
import { type DatePickerProps, type SelectedDates, useResolvedProps } from './date-picker-props';
import type { DatePickerMode, NormalizedValue } from './date-picker-value';
import {
  describeValue,
  getAnchorDate,
  getCalendarDisabled,
  getDateBounds,
  isDateRange,
  normalizeValue,
  toDate,
} from './date-picker-value';
import { DateTextInput } from './date-text-input';

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
        // A click after a whole range starts a new one, instead of moving the nearer end.
        resetOnSelect
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
}) => {
  // The wrapper is the anchor: the single-date text input opens the popover itself and takes no ref.
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div ref={anchorRef} className="relative inline-block w-full">
        {trigger}
      </div>
      <Popover.Content
        align="start"
        anchor={anchorRef}
        variant="flush"
        {...contentProps}
        className={cn('w-auto', contentProps?.className)}
      >
        {children}
      </Popover.Content>
    </Popover>
  );
};

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

/**
 * A date field with a calendar popover, for one day, several or a range.
 * `mode` picks which; `inline` shows the calendar without the popover. Its `aria-label`, or
 * the label of the form row it's in, names the text input or the button that opens it.
 */
export const DatePicker = (props: DatePickerProps) => {
  const { calendarProps, ...o } = useResolvedProps(props);
  const picker = useDatePicker(o);
  const fmt = useFormat();
  const { normalizedValue, isDisabled, hasValue, setIsOpen } = picker;

  const singleInput = (
    <DateTextInput
      singleDate={normalizedValue instanceof Date ? normalizedValue : undefined}
      onChange={o.onChange}
      bounds={picker.bounds}
      calendarDisabled={picker.calendarDisabled}
      clearable={o.clearable}
      clearLabel={o.clearLabel}
      isDisabled={isDisabled}
      placeholder={o.placeholder}
      className={o.className}
      control={o.control}
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
          <Popover.Trigger
            {...o.control}
            render={<Button variant={o.variant} />}
            disabled={isDisabled}
            className={cn('w-full justify-start text-left font-normal', o.className)}
          >
            {describeValue(normalizedValue, fmt.date, o.formatMultiple) ?? o.placeholder}
          </Popover.Trigger>
        )
      }
      contentProps={o.popoverContentProps}
    >
      {calendar}
    </PickerPopover>
  );
};

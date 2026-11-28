import type { Matcher, PropsBase } from 'react-day-picker';
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { Calendar, preloadCalendar } from './on-demand';
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
  const popupRef = useRef<HTMLDivElement>(null);

  const isInside = (node: unknown) =>
    node instanceof Node &&
    [anchorRef, popupRef].some((ref) => ref.current?.contains(node) === true);

  return (
    <Popover
      open={open}
      onOpenChange={(next, details) => {
        // A press on the typed date belongs to it: it keeps the calendar open, or clears the date.
        if (!next && details.reason === 'outside-press' && isInside(details.event.target)) return;
        onOpenChange(next);
      }}
    >
      <div
        ref={anchorRef}
        className="relative inline-block w-full"
        // The calendar's code loads on its first use; start it before the click that opens it.
        onPointerEnter={() => void preloadCalendar()}
        onFocus={() => void preloadCalendar()}
        // Tabbing from the typed date to another field closes the calendar its click opened.
        onBlur={(e) => {
          if (open && e.relatedTarget && !isInside(e.relatedTarget)) onOpenChange(false);
        }}
      >
        {trigger}
      </div>
      <Popover.Content
        align="start"
        anchor={anchorRef}
        ref={popupRef}
        variant="flush"
        {...contentProps}
        className={cn('w-auto', contentProps?.className)}
      >
        {children}
      </Popover.Content>
    </Popover>
  );
};

/**
 * The range or multiple picker's button, showing the dates or the placeholder. Its name is its
 * label, then what it shows: a label alone would hide the dates from screen readers and leave
 * its visible text out of its name. The label is the row's or its own `aria-labelledby`, or its
 * `aria-label` through its own id.
 */
const PickerButton = ({
  control,
  shown,
  placeholder,
  variant,
  disabled,
  className,
}: {
  control: ReturnType<typeof useResolvedProps>['control']['button'];
  shown: string | undefined;
  placeholder: string;
  variant: 'outline' | 'default' | 'ghost';
  disabled: boolean;
  className?: string;
}) => {
  const ownId = useId();
  const textId = useId();
  const id = control.id ?? ownId;
  const label = control['aria-labelledby'] ?? (control['aria-label'] ? id : undefined);

  return (
    <Popover.Trigger
      {...control}
      id={id}
      aria-labelledby={label ? `${label} ${textId}` : undefined}
      render={<Button variant={variant} />}
      disabled={disabled}
      className={cn('w-full justify-start text-left font-normal', className)}
    >
      <span id={textId}>{shown ?? placeholder}</span>
    </Popover.Trigger>
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
  // A click on the typed date opens the calendar beside the caret; a key moves focus into it.
  const [focusCalendar, setFocusCalendar] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedValue = normalizeValue(value, mode);
  const bounds = getDateBounds(withPresent, minDate, maxDate);
  const hasValue = Boolean(getAnchorDate(normalizedValue));

  return {
    isOpen,
    setIsOpen,
    focusCalendar,
    openFromInput: (fromKeyboard: boolean) => {
      setFocusCalendar(fromKeyboard);
      setIsOpen(true);
    },
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
 * `mode` picks which; `inline` shows the calendar without the popover. A click on the field, Enter
 * or Space opens the calendar. Its `aria-label`, or
 * the label of the form row it's in, names the text input or the button that opens it; the
 * button's name goes on with the dates it shows.
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
      flat={o.variant === 'field'}
      control={o.control.input}
      inputRef={picker.inputRef}
      onClear={picker.handleClear}
      onOpen={o.inline ? undefined : picker.openFromInput}
    />
  );

  const showClear = o.clearable && !isDisabled && hasValue && o.mode !== 'single';
  const anchor = getAnchorDate(normalizedValue);

  const calendar = (
    <PickerCalendar
      // A day typed while the calendar is open turns it to that day's month.
      key={o.mode === 'single' && anchor ? `${anchor.getFullYear()}-${anchor.getMonth()}` : 'month'}
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
          <PickerButton
            control={o.control.button}
            shown={describeValue(normalizedValue, fmt.date, o.formatMultiple)}
            placeholder={o.placeholder}
            variant={o.variant === 'field' ? 'ghost' : o.variant}
            disabled={isDisabled}
            className={o.className}
          />
        )
      }
      contentProps={
        picker.focusCalendar
          ? o.popoverContentProps
          : { ...o.popoverContentProps, initialFocus: false }
      }
    >
      {calendar}
    </PickerPopover>
  );
};

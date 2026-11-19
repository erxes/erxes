import { IconCalendar, IconX } from '@tabler/icons-react';
import type { ComponentProps, KeyboardEvent, RefObject } from 'react';
import { useState } from 'react';
import type { Matcher } from 'react-day-picker';
import { dateMatchModifiers } from 'react-day-picker';
import { cn } from '../lib/utils';
import { toIsoDay, useFormat } from '../lib/format';
import { maskInputText, parseInputDate } from './date-picker-value';

type DateDraftOptions = {
  singleDate?: Date;
  onChange: (date: Date | null) => void;
  bounds: { minBound?: Date; maxBound?: Date };
  calendarDisabled: Matcher[];
  clearable: boolean;
  /** Opens the calendar: from the keyboard it takes focus, from a click the caret stays. */
  onOpen?: (fromKeyboard: boolean) => void;
};

/** The text being typed (null while not editing, so the text follows the value) and its handlers. */
const useDateDraft = ({
  singleDate,
  onChange,
  bounds,
  calendarDisabled,
  clearable,
  onOpen,
}: DateDraftOptions) => {
  const [draft, setDraft] = useState<string | null>(null);
  const singleTime = singleDate?.getTime();

  const parseDraft = (text: string | null, loose: boolean) => {
    const date = text ? parseInputDate(text, { ...bounds, loose }) : undefined;

    return date && !dateMatchModifiers(date, calendarDisabled) ? date : undefined;
  };

  const changeTo = (date: Date | undefined) => {
    if (date && date.getTime() !== singleTime) onChange(date);
  };

  const handleChange = (text: string) => {
    const masked = maskInputText(text);
    setDraft(masked);

    if (masked) {
      const parsed = parseDraft(masked, false);

      if (parsed) onChange(parsed);
    } else if (clearable && singleDate) {
      onChange(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const opensPopover = Boolean(onOpen) && (e.key === 'Enter' || e.key === ' ');

    if (!opensPopover && e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    const typed = e.key === 'Enter' ? parseDraft(draft, true) : undefined;

    if (typed && typed.getTime() !== singleTime) {
      setDraft(toIsoDay(typed));
      onChange(typed);
    } else if (opensPopover) {
      onOpen?.(true);
    }
  };

  return {
    draft,
    setDraft,
    handleChange,
    handleKeyDown,
    handleFocus: () => setDraft((current) => current ?? (singleDate ? toIsoDay(singleDate) : '')),
    handleBlur: () => {
      changeTo(parseDraft(draft, true));
      setDraft(null);
    },
  };
};

type DateTextInputProps = DateDraftOptions & {
  clearLabel: string;
  isDisabled: boolean;
  placeholder: string;
  className?: string;
  /** The field's id and the name and state its form row or caller gives it. */
  control: Pick<
    ComponentProps<'input'>,
    'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid' | 'aria-required'
  >;
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
};

/** Typed date entry for single mode: the date in the UI's language at rest, `yyyy-MM-dd` while typing. */
export const DateTextInput = ({
  clearLabel,
  isDisabled,
  placeholder,
  className,
  control,
  inputRef,
  onClear,
  ...options
}: DateTextInputProps) => {
  const { draft, setDraft, handleChange, handleKeyDown, handleFocus, handleBlur } =
    useDateDraft(options);

  const fmt = useFormat();
  const { singleDate } = options;
  const inputText = draft ?? (singleDate ? fmt.date(singleDate) : '');

  // The input spans the whole field under the icon, so a click anywhere but the clear button opens
  // the calendar.
  return (
    <div
      aria-disabled={isDisabled}
      className={cn(
        'relative flex h-7 w-full items-center rounded-sm bg-background text-sm text-foreground shadow-xs transition focus-within:shadow-focus',
        isDisabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        {...control}
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={() => options.onOpen?.(false)}
        autoComplete="off"
        className="h-full w-full min-w-0 flex-1 bg-transparent py-0 pr-8 pl-3 placeholder:text-accent-foreground focus-visible:outline-hidden disabled:cursor-not-allowed"
      />
      {options.clearable && !isDisabled && inputText ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDraft('');
            onClear();
          }}
          className="absolute right-2.5 flex size-5 items-center justify-center rounded-sm text-muted-foreground opacity-50 hover:bg-accent hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:shadow-focus"
        >
          <IconX className="size-4" />
        </button>
      ) : (
        <IconCalendar className="pointer-events-none absolute right-3 size-4 text-muted-foreground opacity-50" />
      )}
    </div>
  );
};

import { IconCalendar, IconX } from '@tabler/icons-react';
import type { KeyboardEvent, RefObject } from 'react';
import { useState } from 'react';
import type { Matcher } from 'react-day-picker';
import { dateMatchModifiers } from 'react-day-picker';
import { cn } from '../lib/utils';
import { formatWith, maskInputText, parseInputDate } from './date-picker-value';

type DateDraftOptions = {
  singleDate?: Date;
  onChange: (date: Date | null) => void;
  format: string;
  bounds: { minBound?: Date; maxBound?: Date };
  calendarDisabled: Matcher[];
  clearable: boolean;
  onOpen?: () => void;
};

/** The text being typed (null while not editing, so the text follows the value) and its handlers. */
const useDateDraft = ({
  singleDate,
  onChange,
  format,
  bounds,
  calendarDisabled,
  clearable,
  onOpen,
}: DateDraftOptions) => {
  const [draft, setDraft] = useState<string | null>(null);
  const singleTime = singleDate?.getTime();

  const parseDraft = (text: string | null, loose: boolean) => {
    const date = text ? parseInputDate(text, format, { ...bounds, loose }) : undefined;

    return date && !dateMatchModifiers(date, calendarDisabled) ? date : undefined;
  };

  const changeTo = (date: Date | undefined) => {
    if (date && date.getTime() !== singleTime) onChange(date);
  };

  const handleChange = (text: string) => {
    const masked = maskInputText(text, format);
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
      setDraft(formatWith(typed, format));
      onChange(typed);
    } else if (opensPopover) {
      onOpen?.();
    }
  };

  return {
    draft,
    setDraft,
    handleChange,
    handleKeyDown,
    handleFocus: () =>
      setDraft((current) => current ?? (singleDate ? formatWith(singleDate, format) : '')),
    handleBlur: () => {
      changeTo(parseDraft(draft, true));
      setDraft(null);
    },
  };
};

type DateTextInputProps = DateDraftOptions & {
  displayFormat: string;
  clearLabel: string;
  isDisabled: boolean;
  placeholder: string;
  className?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onClear: () => void;
};

/** Typed date entry for single mode: the display format at rest, the edit format while typing. */
export const DateTextInput = ({
  displayFormat,
  clearLabel,
  isDisabled,
  placeholder,
  className,
  inputRef,
  onClear,
  ...options
}: DateTextInputProps) => {
  const { draft, setDraft, handleChange, handleKeyDown, handleFocus, handleBlur } =
    useDateDraft(options);

  const { singleDate } = options;
  const inputText = draft ?? (singleDate ? formatWith(singleDate, displayFormat) : '');

  return (
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
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="h-full w-full min-w-0 flex-1 bg-transparent p-0 placeholder:text-accent-foreground/70 focus-visible:outline-hidden disabled:cursor-not-allowed"
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
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-50 hover:bg-accent hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:shadow-focus"
        >
          <IconX className="size-4" />
        </button>
      ) : (
        <IconCalendar className="size-4 shrink-0 text-muted-foreground opacity-50" />
      )}
    </div>
  );
};

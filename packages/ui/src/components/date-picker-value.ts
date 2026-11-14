import {
  endOfDay,
  format as formatDate,
  getDaysInMonth,
  isAfter,
  isBefore,
  isValid,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { DateRange, Matcher } from 'react-day-picker';

type DateInput = Date | string | number;

export type DatePickerValue =
  | DateInput
  | DateInput[]
  | DateRange
  | { from?: DateInput | null; to?: DateInput | null }
  | null
  | undefined;

export type DatePickerMode = 'single' | 'multiple' | 'range';

export type NormalizedValue = Date | Date[] | DateRange | undefined;

// Typed dates are `yyyy-MM-dd` (toIsoDay); pressing Enter also takes unpadded months and days.
const INPUT_PATTERN = 'yyyy-MM-dd';

const LOOSE_INPUT_PATTERNS = [INPUT_PATTERN, 'yyyy-M-d', 'yyyy-MM-d', 'yyyy-M-dd'];

const isDateInput = (value: unknown): value is DateInput =>
  value instanceof Date || typeof value === 'string' || typeof value === 'number';

/** ISO strings without an offset are local time, like the Day.js parser this replaced. */
export const toDate = (value: unknown) => {
  if (!isDateInput(value) || value === '') return undefined;

  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
  const date = isValid(parsed) || typeof value !== 'string' ? parsed : new Date(value);

  return isValid(date) ? date : undefined;
};

const isRangeLike = (
  value: DatePickerValue,
): value is DateRange | { from?: DateInput | null; to?: DateInput | null } =>
  typeof value === 'object' && value !== null && !(value instanceof Date) && !Array.isArray(value);

export const normalizeValue = (value: DatePickerValue, mode: DatePickerMode): NormalizedValue => {
  if (mode === 'multiple') {
    if (!Array.isArray(value)) return undefined;

    return value.map(toDate).filter((date) => date !== undefined);
  }

  if (mode === 'range') {
    if (!isRangeLike(value)) return undefined;

    const from = toDate(value.from);

    return from ? { from, to: toDate(value.to) } : undefined;
  }

  return toDate(value);
};

export const getAnchorDate = (value: NormalizedValue) => {
  if (value instanceof Date) return value;

  if (Array.isArray(value)) return value[0];

  return value?.from;
};

const DATE_SEGMENT_LENGTHS = [4, 2, 2];

const DATE_SEPARATOR = /[-./]/;

const splitDateSegments = (value: string) => {
  const segments = [''];

  for (const char of value) {
    const index = segments.length - 1;
    const isLastSegment = index === DATE_SEGMENT_LENGTHS.length - 1;
    const segment = segments[index] ?? '';

    if (DATE_SEPARATOR.test(char)) {
      if (segment && !isLastSegment) segments.push('');
    } else if (/\d/.test(char)) {
      if (segment.length < (DATE_SEGMENT_LENGTHS[index] ?? 0)) {
        segments[index] = segment + char;
      } else if (!isLastSegment) {
        segments.push(char);
      }
    }
  }

  return segments;
};

const daysInMonth = (year?: string, month?: string) => {
  const monthNumber = Number(month);

  if (year?.length !== 4 || !(monthNumber >= 1 && monthNumber <= 12)) return undefined;

  return getDaysInMonth(new Date(Number(year), monthNumber - 1, 1));
};

/** Masks typed text as `yyyy-MM-dd`, clamping the month and day. */
export const maskInputText = (value: string) => {
  const [year, month, day] = splitDateSegments(value);

  const normalizedMonth =
    month?.length === 2 ? String(Math.min(Number(month), 12)).padStart(2, '0') : month;

  const maxDay = daysInMonth(year, normalizedMonth);

  const normalizedDay =
    day?.length === 2 && maxDay ? String(Math.min(Number(day), maxDay)).padStart(2, '0') : day;

  return [year, normalizedMonth, normalizedDay]
    .filter((segment) => segment !== undefined)
    .join('-');
};

export const getDateBounds = (withPresent: boolean, minDate?: Date, maxDate?: Date) => ({
  minBound: minDate ?? (withPresent ? new Date('1900-01-01') : undefined),
  maxBound: maxDate ?? (withPresent ? new Date() : undefined),
});

export const getCalendarDisabled = (
  disabled: Matcher | Matcher[] | undefined,
  minBound?: Date,
  maxBound?: Date,
): Matcher[] => [
  ...(disabled === undefined ? [] : [disabled].flat()),
  ...(minBound ? [{ before: minBound }] : []),
  ...(maxBound ? [{ after: maxBound }] : []),
];

const isWithinBounds = (date: Date, minBound?: Date, maxBound?: Date) =>
  !(minBound && isBefore(date, startOfDay(minBound))) &&
  !(maxBound && isAfter(date, endOfDay(maxBound)));

/** Parses typed text strictly; `loose` also accepts unpadded months and days. */
export const parseInputDate = (
  text: string,
  { minBound, maxBound, loose }: { minBound?: Date; maxBound?: Date; loose?: boolean },
) => {
  // Strict: the date must format back to the exact text.
  const parsed = (loose ? LOOSE_INPUT_PATTERNS : [INPUT_PATTERN])
    .map((pattern) => ({ pattern, date: parse(text, pattern, new Date()) }))
    .find(({ pattern, date }) => isValid(date) && formatDate(date, pattern) === text)?.date;

  return parsed && isWithinBounds(parsed, minBound, maxBound) ? parsed : undefined;
};

export const isDateRange = (value: NormalizedValue): value is DateRange =>
  value !== undefined && !(value instanceof Date) && !Array.isArray(value);

export const describeValue = (
  value: NormalizedValue,
  formatDay: (date: Date) => string,
  formatMultiple: (count: number) => string,
) => {
  if (Array.isArray(value)) return value.length ? formatMultiple(value.length) : undefined;

  if (!isDateRange(value) || !value.from) return undefined;

  const from = formatDay(value.from);

  return value.to ? [from, formatDay(value.to)].join(' - ') : from;
};

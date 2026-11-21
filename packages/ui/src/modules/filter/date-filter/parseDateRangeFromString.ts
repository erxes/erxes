import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import {
  isMonthToken,
  isYearToken,
  MONTHS,
  normalizeFixedDate,
  parseHalfToken,
  parseQuarterToken,
} from './dateTokens';

const presetRange = (preset: string, today: Date) => {
  const until = endOfDay(today);

  switch (preset) {
    case 'today':
      return { from: startOfDay(today), to: until };
    case 'in-the-past':
      return { from: startOfDay(new Date(1979, 0, 1)), to: until };
    case 'last-1-day':
      return { from: startOfDay(subDays(today, 1)), to: until };
    case 'last-3-days':
      return { from: startOfDay(subDays(today, 3)), to: until };
    case 'last-7-days':
      return { from: startOfDay(subDays(today, 7)), to: until };
    case 'last-3-months':
      return { from: startOfDay(subMonths(today, 3)), to: until };
    default:
      return undefined;
  }
};

/** The whole months from `startMonth`, `count` long, in `year`. */
const months = (year: number, startMonth: number, count: number) => ({
  from: startOfDay(new Date(year, startMonth, 1)),
  to: endOfDay(new Date(year, startMonth + count, 0)),
});

const twoDates = (value: string) => {
  const [from = '', to = ''] = value.split(',');
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime())) return undefined;

  return {
    from: startOfDay(fromDate),
    to: endOfDay(Number.isNaN(toDate.getTime()) ? fromDate : toDate),
  };
};

/**
 * The start and end of the days a date filter's value covers.
 * It reads every value `Filter.Date` writes: presets ("last-7-days", up to today), months
 * ("2026-Mar"), quarters, half years, years ("2026-y") and ranges ("<from>,<to>").
 */
export const parseDateRangeFromString = (
  date?: string | null,
  today: Date = new Date(),
): { from: Date; to: Date } | undefined => {
  if (date == null) return undefined;

  const preset = presetRange(normalizeFixedDate(date), today);

  if (preset) return preset;

  if (isMonthToken(date)) {
    const [year = '', month = ''] = date.split('-');

    return months(
      Number.parseInt(year, 10),
      MONTHS.findIndex((name) => name === month),
      1,
    );
  }

  const quarter = parseQuarterToken(date);

  if (quarter) return months(quarter.year, (quarter.quarter - 1) * 3, 3);

  const half = parseHalfToken(date);

  if (half) return months(half.year, (half.half - 1) * 6, 6);

  if (isYearToken(date)) return months(Number.parseInt(date, 10), 0, 12);

  return date.includes(',') ? twoDates(date) : undefined;
};

/*
 * A date filter's value in the address, as erxes 3.x wrote it: a preset (`today`,
 * `last-7-days`), a month (`2026-Mar`), a quarter (`2026-quarter-3`), a half year
 * (`2026-half-1`), a year (`2026-y`) or a range of two ISO dates (`<from>,<to>`).
 */

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const QUARTERS = ['quarter-1', 'quarter-2', 'quarter-3', 'quarter-4'] as const;

export const HALVES = ['half-1', 'half-2'] as const;

export const FIXED_DATES = [
  'today',
  'in-the-past',
  'last-1-day',
  'last-3-days',
  'last-7-days',
  'last-3-months',
] as const;

export type FixedDate = (typeof FIXED_DATES)[number];

/** Older names of the presets, still in saved links. */
const RENAMED_FIXED_DATES: Record<string, FixedDate> = {
  '1-day-from-now': 'last-1-day',
  '3-days-from-now': 'last-3-days',
  '1-week-from-now': 'last-7-days',
  '3-months-from-now': 'last-3-months',
};

const QUARTER_TOKEN = /^(\d{4})-quarter-([1-4])$/;
const HALF_TOKEN = /^(\d{4})-half-([1-2])$/;
const YEAR_TOKEN = /^\d{4}-y$/;

/** A preset under its current name. */
export const normalizeFixedDate = (value: string): string =>
  Object.hasOwn(RENAMED_FIXED_DATES, value) ? (RENAMED_FIXED_DATES[value] ?? value) : value;

const FIXED_DATE_NAMES: readonly string[] = FIXED_DATES;

export const isFixedDate = (value: string): value is FixedDate => FIXED_DATE_NAMES.includes(value);

const MONTH_NAMES: readonly string[] = MONTHS;

/** A month's index (Jan is 0), or -1 for none. */
export const monthIndex = (name: string) => MONTH_NAMES.indexOf(name);

export const isMonthToken = (value: string) => MONTHS.some((month) => value.includes(month));

export const isYearToken = (value: string) => YEAR_TOKEN.test(value);

export const parseQuarterToken = (value: string) => {
  const match = QUARTER_TOKEN.exec(value);

  return match ? { year: Number(match[1]), quarter: Number(match[2]) } : null;
};

export const parseHalfToken = (value: string) => {
  const match = HALF_TOKEN.exec(value);

  return match ? { year: Number(match[1]), half: Number(match[2]) } : null;
};

/** The dialog tab a value belongs to. */
export const activeTabOf = (value: string) => {
  if (value.includes('half')) return 'halfYear';

  if (value.includes('quarter')) return 'quarter';

  if (isMonthToken(value)) return 'month';

  if (isYearToken(value)) return 'year';

  return 'day';
};

/** The years the dialog offers: seven back, five ahead. */
export const yearsAround = (now = new Date()) => {
  const year = now.getFullYear();

  return Array.from({ length: 13 }, (_, index) => year - 7 + index);
};

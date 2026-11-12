// Shared parsing for the hyphenated quarter/half filter tokens
// (e.g. `2026-quarter-3`, `2026-half-1`) so the range parser and the
// display-label helper derive the numbers from a single source of truth.

import { RENAMED_FIXED_DATES } from '../constants/dateTypes';

const QUARTER_TOKEN = /^(\d{4})-quarter-([1-4])$/;
const HALF_TOKEN = /^(\d{4})-half-([1-2])$/;

export const normalizeFixedDate = (value: string): string =>
  RENAMED_FIXED_DATES.get(value) ?? value;

// The year and number of a `YYYY-<kind>-N` token, or null when it doesn't match.
const parseYearToken = (pattern: RegExp, value: string) => {
  const [, year, number] = pattern.exec(value) ?? [];

  if (!year || !number) return null;

  return { year: Number.parseInt(year, 10), number: Number.parseInt(number, 10) };
};

export const parseQuarterToken = (value: string): { year: number; quarter: number } | null => {
  const token = parseYearToken(QUARTER_TOKEN, value);

  return token && { year: token.year, quarter: token.number };
};

export const parseHalfToken = (value: string): { year: number; half: number } | null => {
  const token = parseYearToken(HALF_TOKEN, value);

  return token && { year: token.year, half: token.number };
};

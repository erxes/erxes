// Shared parsing for the hyphenated quarter/half filter tokens
// (e.g. `2026-quarter-3`, `2026-half-1`) so the range parser and the
// display-label helper derive the numbers from a single source of truth.

const QUARTER_TOKEN = /^(\d{4})-quarter-([1-4])$/;
const HALF_TOKEN = /^(\d{4})-half-([1-2])$/;

export const parseQuarterToken = (
  value: string,
): { year: number; quarter: number } | null => {
  const match = QUARTER_TOKEN.exec(value);
  if (!match) return null;
  return {
    year: Number.parseInt(match[1], 10),
    quarter: Number.parseInt(match[2], 10),
  };
};

export const parseHalfToken = (
  value: string,
): { year: number; half: number } | null => {
  const match = HALF_TOKEN.exec(value);
  if (!match) return null;
  return {
    year: Number.parseInt(match[1], 10),
    half: Number.parseInt(match[2], 10),
  };
};

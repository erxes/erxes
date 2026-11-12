import { format } from 'date-fns';
import { MONTHS } from '../constants/dateTypes';
import { normalizeFixedDate, parseHalfToken, parseQuarterToken } from './dateTokens';
import { parseDateRangeFromString } from './parseDateRangeFromString';

export const getDisplayValue = (rawValue: string) => {
  const value = normalizeFixedDate(rawValue);

  if (value === 'today') {
    return 'Today';
  }

  if (value === 'in-the-past') {
    return 'In the past';
  }

  if (value === 'last-1-day') {
    return 'Last 1 day';
  }

  if (value === 'last-3-days') {
    return 'Last 3 days';
  }

  if (value === 'last-7-days') {
    return 'Last 7 days';
  }

  if (value === 'last-3-months') {
    return 'Last 3 months';
  }

  if (MONTHS.some((month) => value.includes(month))) {
    return value;
  }

  const quarter = parseQuarterToken(value);

  if (quarter) {
    return `${quarter.year} Q${quarter.quarter}`;
  }

  const half = parseHalfToken(value);

  if (half) {
    return `${half.year} H${half.half}`;
  }

  if (/^\d{4}-y$/.test(value)) {
    return value.replace('-y', '');
  }

  const range = value.includes(',') ? parseDateRangeFromString(value) : undefined;

  if (range) {
    return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`;
  }

  return 'Unknown';
};

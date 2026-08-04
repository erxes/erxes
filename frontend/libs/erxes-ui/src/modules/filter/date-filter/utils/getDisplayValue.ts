import { format } from 'date-fns';
import { MONTHS } from '../constants/dateTypes';
import { parseHalfToken, parseQuarterToken } from './dateTokens';

export const getDisplayValue = (value: string) => {
  if (value === 'today') {
    return 'Today';
  }
  if (value === 'in-the-past') {
    return 'In the past';
  }
  if (value === '1-day-from-now') {
    return '1 day from now';
  }
  if (value === '3-days-from-now') {
    return '3 days from now';
  }
  if (value === '1-week-from-now') {
    return '1 week from now';
  }
  if (value === '3-months-from-now') {
    return '3 months from now';
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

  if (value.includes(',')) {
    const [from, to] = value.split(',');
    return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
  }

  return 'Unknown';
};

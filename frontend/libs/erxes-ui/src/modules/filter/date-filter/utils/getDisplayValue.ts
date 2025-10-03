import { format } from 'date-fns';
import { MONTHS } from '../constants/dateTypes';

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

  if (value.includes('quarter')) {
    const [year] = value.split('-');
    const quarterNumber = parseInt(value.split('quarter')[1]);
    return `${year} Q${quarterNumber}`;
  }

  if (value.includes('half')) {
    const [year] = value.split('-');
    const halfNumber = parseInt(value.split('half')[1]);
    return `${year} H${halfNumber}`;
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

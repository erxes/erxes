import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { MONTHS } from 'erxes-ui/modules/filter/date-filter/constants/dateTypes';
import { isUndefinedOrNull } from 'erxes-ui/utils';

export const parseDateRangeFromString = (
  date?: string | null,
): { from: Date; to: Date } | undefined => {
  if (isUndefinedOrNull(date)) return undefined;

  const today = new Date();

  // Predefined date ranges
  const dateRanges: Record<string, { from: Date; to: Date }> = {
    today: {
      from: startOfDay(today),
      to: endOfDay(today),
    },
    'in-the-past': {
      from: startOfDay(new Date(1979, 0, 1)),
      to: endOfDay(today),
    },
    '1-day-from-now': {
      from: startOfDay(subDays(today, 1)),
      to: endOfDay(today),
    },
    '3-days-from-now': {
      from: startOfDay(subDays(today, 3)),
      to: endOfDay(today),
    },
    '1-week-from-now': {
      from: startOfDay(subDays(today, 7)),
      to: endOfDay(today),
    },
    '3-months-from-now': {
      from: startOfDay(subMonths(today, 3)),
      to: endOfDay(today),
    },
  };

  // Check for predefined ranges
  if (dateRanges[date]) {
    return dateRanges[date];
  }

  // Month format: YYYY-MMM
  if (MONTHS.some((month) => date.includes(month))) {
    const [year, month] = date.split('-');
    const monthIndex = MONTHS.indexOf(month);
    return {
      from: startOfDay(new Date(parseInt(year), monthIndex, 1)),
      to: endOfDay(new Date(parseInt(year), monthIndex + 1, 0)),
    };
  }

  // Quarter format: YYYY-quarterN
  if (date.includes('quarter')) {
    const [year] = date.split('-');
    const quarterNumber = parseInt(date.split('quarter')[1]);
    return {
      from: startOfDay(new Date(parseInt(year), (quarterNumber - 1) * 3, 1)),
      to: endOfDay(new Date(parseInt(year), quarterNumber * 3, 0)),
    };
  }

  // Half year format: YYYY-halfN
  if (date.includes('half')) {
    const [year] = date.split('-');
    const halfNumber = parseInt(date.split('half')[1]);
    return {
      from: startOfDay(new Date(parseInt(year), (halfNumber - 1) * 6, 1)),
      to: endOfDay(new Date(parseInt(year), halfNumber * 6, 0)),
    };
  }

  // Year format: YYYY
  if (/^\d{4}-y$/.test(date)) {
    const year = parseInt(date);
    return {
      from: startOfDay(new Date(year, 0, 1)),
      to: endOfDay(new Date(year, 11, 31)),
    };
  }

  // Date range format: fromDate,toDate
  if (date.includes(',')) {
    const [from, to] = date.split(',');
    return {
      from: startOfDay(new Date(from)),
      to: endOfDay(new Date(to)),
    };
  }

  return undefined;
};

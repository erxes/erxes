import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from 'date-fns';
import { parse } from 'date-fns';

export function getDateRange(value: string) {
  const today = new Date();
  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  switch (value) {
    case 'today':
      fromDate = startOfDay(today);
      toDate = endOfDay(today);
      break;
    case 'yesterday':
      const yesterday = subDays(today, 1);
      fromDate = startOfDay(yesterday);
      toDate = endOfDay(yesterday);
      break;
    case 'this-week':
      fromDate = startOfWeek(today, { weekStartsOn: 1 });
      toDate = endOfWeek(today, { weekStartsOn: 1 });
      break;
    case 'last-week':
      const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      fromDate = startOfDay(lastWeekStart);
      toDate = endOfDay(lastWeekEnd);
      break;
    case 'this-month':
      fromDate = startOfMonth(today);
      toDate = endOfMonth(today);
      break;
    case 'last-month':
      const lastMonth = subMonths(today, 1);
      fromDate = startOfMonth(lastMonth);
      toDate = endOfMonth(lastMonth);
      break;
    case 'this-year':
      fromDate = startOfYear(today);
      toDate = endOfYear(today);
      break;
    case 'last-year':
      const lastYear = subYears(today, 1);
      fromDate = startOfYear(lastYear);
      toDate = endOfYear(lastYear);
      break;
    default:
      if (value.startsWith('custom:')) {
        const dateString = value.replace('custom:', '');
        try {
          const customDate = parse(dateString, 'yyyy-MM-dd', new Date());
          fromDate = startOfDay(customDate);
          toDate = endOfDay(customDate);
        } catch {
          return { fromDate: undefined, toDate: undefined };
        }
      }
      break;
  }

  return { fromDate, toDate };
}

export function getFilters(value?: string) {
  const filters: {
    limit: number;
    fromDate?: string;
    toDate?: string;
  } = {
    limit: 10,
  };

  if (value) {
    const { fromDate, toDate } = getDateRange(value);
    if (fromDate) {
      filters.fromDate = fromDate.toISOString();
    }
    if (toDate) {
      filters.toDate = toDate.toISOString();
    }
  }

  return filters;
}


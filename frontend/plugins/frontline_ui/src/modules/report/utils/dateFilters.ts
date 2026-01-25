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

  // Constants
  const MONTHS = [
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
  ];

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
      const lastWeekStart = startOfWeek(subWeeks(today, 1), {
        weekStartsOn: 1,
      });
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
      } else if (MONTHS.some((month) => value.includes(month))) {
        // Month format: YYYY-MMM
        const [year, month] = value.split('-');
        const monthIndex = MONTHS.indexOf(month);
        fromDate = startOfDay(new Date(parseInt(year), monthIndex, 1));
        toDate = endOfDay(new Date(parseInt(year), monthIndex + 1, 0));
      } else if (value.includes('quarter')) {
        // Quarter format: YYYY-quarterN
        const [year] = value.split('-');
        const quarterNumber = Number.parseInt(value.split('quarter')[1]);
        fromDate = startOfDay(
          new Date(parseInt(year), (quarterNumber - 1) * 3, 1),
        );
        toDate = endOfDay(new Date(parseInt(year), quarterNumber * 3, 0));
      } else if (value.includes('half')) {
        // Half year format: YYYY-halfN
        const [year] = value.split('-');
        const halfNumber = Number.parseInt(value.split('half')[1]);
        fromDate = startOfDay(
          new Date(parseInt(year), (halfNumber - 1) * 6, 1),
        );
        toDate = endOfDay(new Date(parseInt(year), halfNumber * 6, 0));
      } else if (/^\d{4}-y$/.test(value)) {
        // Year format: YYYY-y
        const year = Number.parseInt(value);
        fromDate = startOfDay(new Date(year, 0, 1));
        toDate = endOfDay(new Date(year, 11, 31));
      } else if (value.includes(',')) {
        // Date range format: fromDate,toDate
        const [from, to] = value.split(',');
        fromDate = startOfDay(new Date(from));
        toDate = endOfDay(new Date(to));
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

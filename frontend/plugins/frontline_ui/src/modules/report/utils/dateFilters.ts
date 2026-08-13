import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { parseDateRangeFromString } from 'erxes-ui';

export function getDateRange(value: string) {
  const today = new Date();
  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  switch (value) {
    case 'today': {
      fromDate = startOfDay(today);
      toDate = endOfDay(today);
      break;
    }
    case 'yesterday': {
      const yesterday = subDays(today, 1);
      fromDate = startOfDay(yesterday);
      toDate = endOfDay(yesterday);
      break;
    }
    case 'this-week': {
      fromDate = startOfDay(startOfWeek(today, { weekStartsOn: 1 }));
      toDate = endOfDay(endOfWeek(today, { weekStartsOn: 1 }));
      break;
    }
    case 'last-week': {
      const lastWeek = subWeeks(today, 1);
      fromDate = startOfDay(startOfWeek(lastWeek, { weekStartsOn: 1 }));
      toDate = endOfDay(endOfWeek(lastWeek, { weekStartsOn: 1 }));
      break;
    }
    case 'this-month': {
      fromDate = startOfDay(startOfMonth(today));
      toDate = endOfDay(endOfMonth(today));
      break;
    }
    case 'last-month': {
      const lastMonth = subMonths(today, 1);
      fromDate = startOfDay(startOfMonth(lastMonth));
      toDate = endOfDay(endOfMonth(lastMonth));
      break;
    }
    case 'last-3-months': {
      fromDate = startOfDay(startOfMonth(subMonths(today, 3)));
      toDate = endOfDay(today);
      break;
    }
    case 'this-year': {
      fromDate = startOfDay(startOfYear(today));
      toDate = endOfDay(endOfYear(today));
      break;
    }
    case 'last-year': {
      const lastYear = subYears(today, 1);
      fromDate = startOfDay(startOfYear(lastYear));
      toDate = endOfDay(endOfYear(lastYear));
      break;
    }
    default: {
      if (value.startsWith('custom:')) {
        const dateString = value.replace('custom:', '');
        try {
          const customDate = parse(dateString, 'yyyy-MM-dd', new Date());
          fromDate = startOfDay(customDate);
          toDate = endOfDay(customDate);
        } catch {
          return { fromDate: undefined, toDate: undefined };
        }
        break;
      }

      // Month, quarter, half-year, year and day-range values are written by the
      // shared date filter dialog, so the shared parser owns their format. It
      // is the only place that knows a quarter arrives as `2026-quarter-1`
      // rather than `2026-quarter1`; reading the number out by hand here took
      // the hyphen as a minus sign and moved the range into the wrong year.
      const range = parseDateRangeFromString(value);
      if (range) {
        fromDate = range.from;
        toDate = range.to;
      }
      break;
    }
  }

  return { fromDate, toDate };
}

export function getFilters(value?: string) {
  const filters: {
    fromDate?: string;
    toDate?: string;
  } = {};

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

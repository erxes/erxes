import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  parse,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from 'date-fns';
import { parseDateRangeFromString } from 'erxes-ui';

export const CUSTOM_TIME_PREFIX = 'custom-time:';

export function buildCustomTimeRange(from: Date, to: Date): string {
  return `${CUSTOM_TIME_PREFIX}${from.toISOString()},${to.toISOString()}`;
}

export function parseCustomTimeRange(
  value?: string | null,
): { from: Date; to: Date } | undefined {
  if (!value?.startsWith(CUSTOM_TIME_PREFIX)) return undefined;

  const [from, to] = value.slice(CUSTOM_TIME_PREFIX.length).split(',');
  const fromDate = new Date(from);
  const toDate = new Date(to ?? from);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return undefined;
  }

  return { from: fromDate, to: toDate };
}

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
    case 'this-quarter': {
      fromDate = startOfDay(startOfQuarter(today));
      toDate = endOfDay(endOfQuarter(today));
      break;
    }
    case 'last-quarter': {
      const lastQuarter = subQuarters(today, 1);
      fromDate = startOfDay(startOfQuarter(lastQuarter));
      toDate = endOfDay(endOfQuarter(lastQuarter));
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
      const timeRange = parseCustomTimeRange(value);
      if (timeRange) {
        fromDate = timeRange.from;
        toDate = timeRange.to;
        break;
      }

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

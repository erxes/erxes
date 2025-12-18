import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';

export const calculatePercentage = (count: number, total: number): number =>
  total > 0 ? Math.round((count / total) * 100) : 0;

export const normalizeStatus = (status?: string) => {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  return Object.values(CONVERSATION_STATUSES).includes(upper as any)
    ? upper
    : undefined;
};

export const getDateRange = (dateRange: {
  type: string;
  fromDate?: Date | string;
  toDate?: Date | string;
}): { startDate: Date; endDate: Date } | null => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (dateRange.type) {
    case 'TODAY': {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    }
    case 'YESTERDAY': {
      const yesterday = subDays(now, 1);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);
      break;
    }
    case 'THIS_WEEK': {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    }
    case 'LAST_WEEK': {
      const lastWeek = subWeeks(now, 1);
      startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
      endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;
    }
    case 'THIS_MONTH': {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    }
    case 'LAST_MONTH': {
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    }
    case 'THIS_YEAR': {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    }
    case 'LAST_YEAR': {
      const lastYear = subYears(now, 1);
      startDate = startOfYear(lastYear);
      endDate = endOfYear(lastYear);
      break;
    }
    case 'CUSTOM': {
      if (!dateRange.fromDate || !dateRange.toDate) {
        throw new Error(
          'Both fromDate and toDate are required for CUSTOM date range',
        );
      }
      startDate = new Date(dateRange.fromDate);
      endDate = new Date(dateRange.toDate);
      break;
    }
    default:
      return null;
  }

  return { startDate, endDate };
};

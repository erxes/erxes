import { z } from 'zod';
import {
  IPricingActiveWindow,
  PricingScheduleMoment,
  PricingScheduleWindowType,
} from '@/pricing/types';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_MINUTES = 24 * 60;
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const SCHEDULE_WINDOW_TYPES: PricingScheduleWindowType[] = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
];

export const SCHEDULE_MOMENTS: PricingScheduleMoment[] = [
  'checkout',
  'orderCreated',
  'either',
];

// Monday first, as people read a week; values stay 0 = Sunday … 6.
export const SCHEDULE_WEEK = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const WEEKDAY_PRESETS: Record<string, number[]> = {
  weekdays: [1, 2, 3, 4, 5],
  weekend: [6, 0],
};

export const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
export const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const pad = (value: number) => String(value).padStart(2, '0');

export const toMonthDay = (month: number, day: number) =>
  `${pad(month)}-${pad(day)}`;

// Every day a month can have, 29 February included.
export const daysInMonth = (month: number) => DAYS_IN_MONTH[month - 1] || 31;

export const isMonthDay = (value?: string | null) =>
  !!value &&
  /^\d{2}-\d{2}$/.test(value) &&
  Number(value.slice(0, 2)) >= 1 &&
  Number(value.slice(0, 2)) <= 12 &&
  Number(value.slice(3)) >= 1 &&
  Number(value.slice(3)) <= DAYS_IN_MONTH[Number(value.slice(0, 2)) - 1];

// '12-15' → '12/15'
export const formatMonthDay = (value?: string | null) =>
  value ? `${Number(value.slice(0, 2))}/${Number(value.slice(3))}` : '';

const scheduleWindowFields = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  allDay: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  weekDays: z.array(z.number().int().min(0).max(6)),
  monthDays: z.array(z.number().int().min(1).max(31)),
  fromMonthDay: z.string(),
  toMonthDay: z.string(),
});

export type ScheduleWindowFormValues = z.infer<typeof scheduleWindowFields>;

export const createScheduleWindowSchema = (t: (key: string) => string) =>
  scheduleWindowFields.superRefine((values, ctx) => {
    const issue = (path: keyof ScheduleWindowFormValues, key: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message: t(key) });

    if (values.type === 'weekly' && !values.weekDays.length) {
      issue('weekDays', 'schedule-week-days-required');
    }

    if (values.type === 'monthly' && !values.monthDays.length) {
      issue('monthDays', 'schedule-month-days-required');
    }

    if (values.type === 'yearly') {
      if (!isMonthDay(values.fromMonthDay)) {
        issue('fromMonthDay', 'schedule-month-day-invalid');
      }

      if (!isMonthDay(values.toMonthDay)) {
        issue('toMonthDay', 'schedule-month-day-invalid');
      }
    }

    if (values.allDay) {
      return;
    }

    if (!TIME.test(values.startTime)) {
      issue('startTime', 'schedule-time-required');
    }

    if (!TIME.test(values.endTime)) {
      issue('endTime', 'schedule-time-required');
    } else if (values.startTime === values.endTime) {
      issue('endTime', 'schedule-same-time');
    }
  });

export const isAllDay = (
  window: Pick<IPricingActiveWindow, 'startTime' | 'endTime'>,
) => window.startTime === '00:00' && window.endTime === '24:00';

export const runsPastMidnight = (
  window: Pick<IPricingActiveWindow, 'startTime' | 'endTime'>,
) => window.endTime !== '24:00' && window.endTime < window.startTime;

export const wrapsNewYear = (window: IPricingActiveWindow) =>
  window.type === 'yearly' &&
  !!window.fromMonthDay &&
  !!window.toMonthDay &&
  window.fromMonthDay > window.toMonthDay;

export const windowToFormValues = (
  window?: IPricingActiveWindow | null,
): ScheduleWindowFormValues => ({
  type: window?.type || 'weekly',
  allDay: !!window && isAllDay(window),
  startTime: window && !isAllDay(window) ? window.startTime : '',
  endTime: window && !isAllDay(window) ? window.endTime : '',
  weekDays: window?.weekDays || [],
  monthDays: window?.monthDays || [],
  fromMonthDay: window?.fromMonthDay || '06-01',
  toMonthDay: window?.toMonthDay || '08-31',
});

// The mutation input has no __typename and only the fields the type reads.
export const toWindowInput = (
  window: IPricingActiveWindow,
): IPricingActiveWindow => {
  const base = {
    type: window.type,
    startTime: window.startTime,
    endTime: window.endTime,
  };

  switch (window.type) {
    case 'weekly':
      return {
        ...base,
        weekDays: [...(window.weekDays || [])].sort((a, b) => a - b),
      };
    case 'monthly':
      return {
        ...base,
        monthDays: [...(window.monthDays || [])].sort((a, b) => a - b),
      };
    case 'yearly':
      return {
        ...base,
        fromMonthDay: window.fromMonthDay,
        toMonthDay: window.toMonthDay,
      };
    default:
      return base;
  }
};

export const formValuesToWindow = (
  values: ScheduleWindowFormValues,
): IPricingActiveWindow =>
  toWindowInput({
    type: values.type,
    startTime: values.allDay ? '00:00' : values.startTime,
    endTime: values.allDay ? '24:00' : values.endTime,
    weekDays: values.weekDays,
    monthDays: values.monthDays,
    fromMonthDay: values.fromMonthDay,
    toMonthDay: values.toMonthDay,
  });

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

export interface ScheduleSegment {
  from: number;
  to: number;
  overnight: boolean;
}

// Bars for one weekday row, in minutes, from daily and weekly windows only;
// an overnight window spills into the next day's row.
export const daySegments = (
  windows: IPricingActiveWindow[],
  day: number,
): ScheduleSegment[] =>
  windows.flatMap((window) => {
    if (window.type !== 'daily' && window.type !== 'weekly') {
      return [];
    }

    const start = toMinutes(window.startTime);
    const end =
      window.endTime === '24:00' ? DAY_MINUTES : toMinutes(window.endTime);
    const startsOn = (weekDay: number) =>
      window.type === 'daily' || !!window.weekDays?.includes(weekDay);
    const overnight = end <= start;
    const segments: ScheduleSegment[] = [];

    if (startsOn(day)) {
      segments.push({
        from: start,
        to: overnight ? DAY_MINUTES : end,
        overnight,
      });
    }

    if (overnight && startsOn((day + 6) % 7)) {
      segments.push({ from: 0, to: end, overnight });
    }

    return segments;
  });

export const hasWeekWindows = (windows: IPricingActiveWindow[]) =>
  windows.some((window) => window.type === 'daily' || window.type === 'weekly');

export const minutesToPercent = (minutes: number) =>
  `${(minutes / DAY_MINUTES) * 100}%`;

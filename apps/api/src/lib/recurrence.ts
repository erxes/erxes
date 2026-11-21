import { addDays, type CalendarDate, isoDay, zonedDate, zonedInstant } from './orgTime';

/**
 * A repeating wall-clock time: every `interval` days, weeks (on `weekdays`)
 * or months (on `dayOfMonth`), at `at` on a time zone's clock. Automations'
 * schedules and recurring broadcasts both read it.
 */
export interface Recurrence {
  frequency: 'day' | 'week' | 'month';
  /** Every N periods, counted from `startsOn`'s; default 1. */
  interval?: number;
  /** `week`: 1 = Monday … 7 = Sunday; none: Monday. */
  weekdays?: readonly number[];
  /** `month`: the day, or the month's last day when it has fewer; none: the 1st. */
  dayOfMonth?: number | null;
  /** `HH:MM`. */
  at: string;
  /** `YYYY-MM-DD`: the first day it may run, and where `interval` counts from. */
  startsOn?: string | null;
}

const DAY = 86_400_000;

const utcDay = (date: CalendarDate) => Date.UTC(date.year, date.month - 1, date.day);

const parseDay = (day: string): CalendarDate => {
  const [year = 1970, month = 1, dayOfMonth = 1] = day.split('-').map(Number);

  // Through addDays, so the weekday comes with it.
  return addDays({ year, month, day: dayOfMonth, weekday: 1 }, 0);
};

const daysBetween = (from: CalendarDate, to: CalendarDate) =>
  Math.round((utcDay(to) - utcDay(from)) / DAY);

/** The Monday of a date's week. */
const mondayOf = (date: CalendarDate) => addDays(date, 1 - date.weekday);

const lastDayOf = (date: CalendarDate) => new Date(Date.UTC(date.year, date.month, 0)).getUTCDate();

/** Whether the rule runs on `date`, `anchor` being the day its periods count from. */
const runsOn = (rule: Recurrence, anchor: CalendarDate, date: CalendarDate) => {
  const interval = rule.interval ?? 1;

  switch (rule.frequency) {
    case 'day':
      return daysBetween(anchor, date) % interval === 0;
    case 'week': {
      const weekdays = rule.weekdays?.length ? rule.weekdays : [1];
      const weeks = daysBetween(mondayOf(anchor), mondayOf(date)) / 7;

      return weekdays.includes(date.weekday) && weeks % interval === 0;
    }

    case 'month': {
      const months = (date.year - anchor.year) * 12 + date.month - anchor.month;

      return (
        months % interval === 0 && date.day === Math.min(rule.dayOfMonth ?? 1, lastDayOf(date))
      );
    }
  }
};

/** Days to look ahead: a whole period of the rule and a year more. */
const horizon = (rule: Recurrence) =>
  (rule.interval ?? 1) * { day: 1, week: 7, month: 31 }[rule.frequency] + 400;

/**
 * The first time the rule runs after `after` on `timeZone`'s clock. The wall
 * clock is kept across summer time: 09:00 is 09:00 before and after the change.
 */
export const nextRun = (rule: Recurrence, timeZone: string, after: Date): Date => {
  const [hour = 0, minute = 0] = rule.at.split(':').map(Number);
  const today = zonedDate(after, timeZone);
  const anchor = rule.startsOn ? parseDay(rule.startsOn) : today;
  const start = isoDay(anchor) > isoDay(today) ? anchor : today;

  for (let offset = 0, last = horizon(rule); offset < last; offset += 1) {
    const date = addDays(start, offset);

    if (runsOn(rule, anchor, date)) {
      const instant = zonedInstant(timeZone, date, hour, minute);

      if (instant.getTime() > after.getTime()) return instant;
    }
  }

  throw new Error('the rule never runs');
};

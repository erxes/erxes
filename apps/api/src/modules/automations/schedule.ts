import { TZDate } from '@date-fns/tz';
import type { AutomationTrigger } from '@erxes/core-contract';

/** The ISO weekday of a JavaScript day (0 = Sunday): 1 = Monday … 7 = Sunday. */
const isoWeekday = (day: number) => ((day + 6) % 7) + 1;

/** The calendar date (and weekday, 1 = Monday) of an instant in a time zone. */
export const zonedDate = (instant: Date, timeZone: string) => {
  const local = new TZDate(instant, timeZone);

  return {
    year: local.getFullYear(),
    month: local.getMonth() + 1,
    day: local.getDate(),
    weekday: isoWeekday(local.getDay()),
  };
};

type Timed = Extract<AutomationTrigger, { kind: 'schedule' | 'date' }>;

/**
 * The next time a scheduled or date trigger fires after `after`. Date
 * triggers tick daily at their time (each tick finds the records due that day).
 */
export const nextOccurrence = (trigger: Timed, after: Date): Date => {
  const [hour = 9, minute = 0] = (trigger.at ?? '09:00').split(':').map(Number);
  const zone = trigger.timezone ?? 'Asia/Ulaanbaatar';

  if (trigger.kind === 'schedule' && trigger.every === 'hour') {
    const next = new Date(after.getTime());

    next.setUTCSeconds(0, 0);
    next.setUTCMinutes(minute);

    if (next.getTime() <= after.getTime()) next.setUTCHours(next.getUTCHours() + 1);

    return next;
  }

  const start = zonedDate(after, zone);

  // Look at most a year and a bit ahead, day by day.
  for (let offset = 0; offset < 400; offset += 1) {
    const day = new Date(Date.UTC(start.year, start.month - 1, start.day + offset));

    const date = {
      year: day.getUTCFullYear(),
      month: day.getUTCMonth() + 1,
      day: day.getUTCDate(),
      weekday: isoWeekday(day.getUTCDay()),
    };

    if (trigger.kind === 'schedule') {
      if (
        trigger.every === 'week' &&
        trigger.weekdays?.length &&
        !trigger.weekdays.includes(date.weekday)
      )
        continue;

      if (trigger.every === 'week' && !trigger.weekdays?.length && date.weekday !== 1) continue;

      if (trigger.every === 'month') {
        const lastDay = new Date(Date.UTC(date.year, date.month, 0)).getUTCDate();

        if (date.day !== Math.min(trigger.dayOfMonth ?? 1, lastDay)) continue;
      }
    }

    const instant = new TZDate(date.year, date.month - 1, date.day, hour, minute, zone).getTime();

    if (instant > after.getTime()) return new Date(instant);
  }

  throw new Error('no next occurrence within a year');
};

import { TZDate } from '@date-fns/tz';
import type { AutomationTrigger } from '@erxes/core-contract';
import { nextRun } from '~/lib/recurrence';

type Timed = Extract<AutomationTrigger, { kind: 'schedule' | 'date' }>;

const MINUTE = 60_000;
const HOUR = 3_600_000;

export const MIN_MINUTES = 5;
export const MAX_HOURS = 23;

const nextMinutes = (every: number, after: Date) =>
  new Date((Math.floor(after.getTime() / (every * MINUTE)) + 1) * every * MINUTE);

/** The next time `minute` past an hour comes after `after`, on the zone's clock. */
const nextHourly = (minute: number, after: Date, timeZone: string) => {
  // Counted in elapsed minutes, not on the wall clock: a DST change neither skips nor repeats a run.
  const ahead = (minute - new TZDate(after, timeZone).getMinutes() + 60) % 60;
  const next = Math.floor(after.getTime() / MINUTE) * MINUTE + ahead * MINUTE;

  return new Date(next > after.getTime() ? next : next + HOUR);
};

const nextHours = (every: number, minute: number, after: Date, timeZone: string): Date => {
  const next = nextHourly(minute, after, timeZone);

  return new TZDate(next, timeZone).getHours() % every === 0
    ? next
    : nextHours(every, minute, next, timeZone);
};

/**
 * The next time a scheduled or date trigger fires after `after`, on the
 * organisation's clock (`timeZone`). Date triggers tick daily at their time
 * (each tick finds the records due that day).
 */
export const nextOccurrence = (trigger: Timed, timeZone: string, after: Date): Date => {
  const at = trigger.at ?? '09:00';

  if (trigger.kind === 'date') return nextRun({ frequency: 'day', at }, timeZone, after);

  if (trigger.every === 'minute')
    return nextMinutes(Math.max(trigger.interval ?? MIN_MINUTES, MIN_MINUTES), after);

  if (trigger.every === 'hour')
    return nextHours(
      Math.min(trigger.interval ?? 1, MAX_HOURS),
      Number(at.split(':')[1] ?? 0),
      after,
      timeZone,
    );

  return nextRun(
    { frequency: trigger.every, weekdays: trigger.weekdays, dayOfMonth: trigger.dayOfMonth, at },
    timeZone,
    after,
  );
};

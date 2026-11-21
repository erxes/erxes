import { TZDate } from '@date-fns/tz';
import type { AutomationTrigger } from '@erxes/core-contract';
import { nextRun } from '~/lib/recurrence';

type Timed = Extract<AutomationTrigger, { kind: 'schedule' | 'date' }>;

/** The next time `minute` past an hour comes after `after`, on the zone's clock. */
const nextHourly = (minute: number, after: Date, timeZone: string) => {
  // Counted in elapsed minutes, not on the wall clock: a DST change neither skips nor repeats a run.
  const ahead = (minute - new TZDate(after, timeZone).getMinutes() + 60) % 60;
  const next = Math.floor(after.getTime() / 60_000) * 60_000 + ahead * 60_000;

  return new Date(next > after.getTime() ? next : next + 3_600_000);
};

/**
 * The next time a scheduled or date trigger fires after `after`, on the
 * organisation's clock (`timeZone`). Date triggers tick daily at their time
 * (each tick finds the records due that day).
 */
export const nextOccurrence = (trigger: Timed, timeZone: string, after: Date): Date => {
  const at = trigger.at ?? '09:00';

  if (trigger.kind === 'date') return nextRun({ frequency: 'day', at }, timeZone, after);

  if (trigger.every === 'hour') return nextHourly(Number(at.split(':')[1] ?? 0), after, timeZone);

  return nextRun(
    { frequency: trigger.every, weekdays: trigger.weekdays, dayOfMonth: trigger.dayOfMonth, at },
    timeZone,
    after,
  );
};

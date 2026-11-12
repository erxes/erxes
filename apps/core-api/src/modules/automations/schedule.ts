import type { AutomationTrigger } from '@erxes/core-contract';

/** A wall-clock time in a time zone → that instant (handles offsets and DST by correcting twice). */
export const zonedToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) => {
  const guess = Date.UTC(year, month - 1, day, hour, minute);

  const offset = (instant: number) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
        .formatToParts(new Date(instant))
        .map((part) => [part.type, part.value]),
    );

    return (
      Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
      ) - instant
    );
  };

  const first = guess - offset(guess);

  return new Date(guess - offset(first));
};

/** The calendar date (and weekday, 1 = Monday) of an instant in a time zone. */
export const zonedDate = (instant: Date, timeZone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );

  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday!) + 1;

  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), weekday };
};

type Timed = Extract<AutomationTrigger, { kind: 'schedule' | 'date' }>;

/**
 * The next time a scheduled or date trigger fires after `after`. Date
 * triggers tick daily at their time (each tick finds the records due that day).
 */
export const nextOccurrence = (trigger: Timed, after: Date): Date => {
  const [hour, minute] = (trigger.at ?? '09:00').split(':').map(Number) as [number, number];
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
      weekday: ((day.getUTCDay() + 6) % 7) + 1,
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

    const instant = zonedToUtc(date.year, date.month, date.day, hour, minute, zone);

    if (instant.getTime() > after.getTime()) return instant;
  }

  throw new Error('no next occurrence within a year');
};

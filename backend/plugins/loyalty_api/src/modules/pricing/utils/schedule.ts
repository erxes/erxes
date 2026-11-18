import { IPricingPlan } from '../@types/pricingPlan';
import { IActiveWindow, ScheduleMoment } from '../@types/schedule';

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCAL_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type CalendarDay = { date: string; weekDay: number; monthDay: number };
type WallClock = CalendarDay & { minute: number };

type ScheduleWindows = Pick<IPricingPlan, 'activeWindows' | 'closedDates'>;
type SchedulePlan = ScheduleWindows &
  Pick<IPricingPlan, 'isRepeatEnabled' | 'scheduleMoment'>;

const pad = (value: number) => String(value).padStart(2, '0');

// A UTC instant read on UTC fields is a plain calendar, free of any zone.
const calendarDay = (utc: Date): CalendarDay => ({
  date: `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(
    utc.getUTCDate(),
  )}`,
  weekDay: utc.getUTCDay(),
  monthDay: utc.getUTCDate(),
});

const previousDay = (day: CalendarDay): CalendarDay =>
  calendarDay(new Date(Date.parse(`${day.date}T00:00:00Z`) - DAY_MS));

const wallClock = (at: Date, timeZone: string): WallClock => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(at)
      .map((part) => [part.type, part.value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekDay: WEEKDAYS[parts.weekday],
    monthDay: Number(parts.day),
    minute: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

/**
 * Reads 'YYYY-MM-DDTHH:mm' as a wall clock, for checking a schedule without
 * a real moment behind it.
 */
export const wallClockFromLocal = (local: string): WallClock => {
  const match = LOCAL_TIME.exec(local);

  if (!match) {
    throw new Error('Time must be YYYY-MM-DDTHH:mm');
  }

  const [, year, month, day, hour, minute] = match.map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));

  if (utc.getUTCMonth() !== month - 1 || hour > 23 || minute > 59) {
    throw new Error('Time must be YYYY-MM-DDTHH:mm');
  }

  return { ...calendarDay(utc), minute: hour * 60 + minute };
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

// A window belongs to the day it starts on, so its days and closed dates are
// read there: Friday 22:00–02:00 still holds at 01:00 on Saturday.
const startsOn = (
  window: IActiveWindow,
  day: CalendarDay,
  closed: Set<string>,
) => {
  if (closed.has(day.date)) {
    return false;
  }

  switch (window.type) {
    case 'daily':
      return true;
    case 'weekly':
      return !!window.weekDays?.includes(day.weekDay);
    case 'monthly':
      return !!window.monthDays?.includes(day.monthDay);
    case 'yearly': {
      const monthDay = day.date.slice(5);
      const from = window.fromMonthDay || '';
      const to = window.toMonthDay || '';

      return from <= to
        ? monthDay >= from && monthDay <= to
        : monthDay >= from || monthDay <= to;
    }
    default:
      return false;
  }
};

/**
 * The window a schedule is in on a wall clock, ends exclusive.
 */
export const activeWindowOnClock = (
  plan: ScheduleWindows,
  today: WallClock,
): IActiveWindow | null => {
  const closed = new Set(plan.closedDates || []);
  let yesterday: CalendarDay | undefined;

  for (const window of plan.activeWindows || []) {
    const start = toMinutes(window.startTime);
    const end = toMinutes(window.endTime);

    if (start < end) {
      if (
        today.minute >= start &&
        today.minute < end &&
        startsOn(window, today, closed)
      ) {
        return window;
      }

      continue;
    }

    if (today.minute >= start && startsOn(window, today, closed)) {
      return window;
    }

    if (today.minute < end) {
      yesterday ??= previousDay(today);

      if (startsOn(window, yesterday, closed)) {
        return window;
      }
    }
  }

  return null;
};

export const activeWindowAt = (
  plan: ScheduleWindows,
  at: Date,
  timeZone: string,
) => activeWindowOnClock(plan, wallClock(at, timeZone));

/**
 * Which of a purchase's moments the schedule holds at, by the plan's choice:
 * the moment that matched, or null when none did.
 */
export const matchScheduleMoment = <TMoment>(
  scheduleMoment: ScheduleMoment | undefined,
  moments: { checkout: TMoment; orderCreated?: TMoment },
  holds: (moment: TMoment) => boolean,
): 'checkout' | 'orderCreated' | null => {
  // Without an order start, the purchase is new and starts at checkout.
  const orderCreated = moments.orderCreated ?? moments.checkout;

  switch (scheduleMoment) {
    case 'orderCreated':
      return holds(orderCreated) ? 'orderCreated' : null;
    case 'either':
      if (holds(moments.checkout)) {
        return 'checkout';
      }

      return holds(orderCreated) ? 'orderCreated' : null;
    default:
      return holds(moments.checkout) ? 'checkout' : null;
  }
};

export const isPlanScheduledAt = (
  plan: SchedulePlan,
  moments: { checkout: Date; orderCreated?: Date },
  timeZone: string,
) =>
  !plan.isRepeatEnabled ||
  !!matchScheduleMoment(
    plan.scheduleMoment,
    moments,
    (at) => !!activeWindowAt(plan, at, timeZone),
  );

/**
 * The moment that matched and the window it fell in, or null when the plan's
 * schedule does not hold for this purchase.
 */
export const scheduleMatchAt = (
  plan: SchedulePlan,
  moments: { checkout: Date; orderCreated?: Date },
  timeZone: string,
) => {
  const moment = matchScheduleMoment(
    plan.scheduleMoment,
    moments,
    (at) => !!activeWindowAt(plan, at, timeZone),
  );

  if (!moment) {
    return null;
  }

  const at =
    moment === 'orderCreated'
      ? moments.orderCreated ?? moments.checkout
      : moments.checkout;
  const window = activeWindowAt(plan, at, timeZone);

  return window ? { moment, window } : null;
};

const MINUTE_MS = 60 * 1000;
// A schedule repeats at least yearly, so a year and a little covers every start.
const LOOKAHEAD_DAYS = 400;

const dayFromDate = (date: string) =>
  calendarDay(new Date(Date.parse(`${date}T00:00:00Z`)));

const addDays = (day: CalendarDay, days: number) =>
  calendarDay(new Date(Date.parse(`${day.date}T00:00:00Z`) + days * DAY_MS));

// How far the zone's wall clock is ahead of UTC at a moment.
const zoneOffset = (at: Date, timeZone: string) => {
  const clock = wallClock(at, timeZone);
  const wall = Date.parse(`${clock.date}T00:00:00Z`) + clock.minute * MINUTE_MS;

  return wall - (at.getTime() - (at.getTime() % MINUTE_MS));
};

// The real moment a wall-clock minute of a day falls on in the zone.
const instantOf = (date: string, minute: number, timeZone: string) => {
  const wall = Date.parse(`${date}T00:00:00Z`) + minute * MINUTE_MS;
  const guess = wall - zoneOffset(new Date(wall), timeZone);

  return new Date(wall - zoneOffset(new Date(guess), timeZone));
};

const windowSpan = (
  window: IActiveWindow,
  day: CalendarDay,
  timeZone: string,
) => {
  const start = toMinutes(window.startTime);
  const end = toMinutes(window.endTime);

  return {
    startsAt: instantOf(day.date, start, timeZone),
    endsAt: instantOf(
      end <= start ? addDays(day, 1).date : day.date,
      end,
      timeZone,
    ),
  };
};

/**
 * When a schedule's windows open and close around a moment: the window it is
 * in and when that closes, the next start, and a window that closed earlier
 * the same day.
 */
export const scheduleTimesAt = (
  plan: ScheduleWindows,
  at: Date,
  timeZone: string,
) => {
  const closed = new Set(plan.closedDates || []);
  const windows = plan.activeWindows || [];
  const today = dayFromDate(wallClock(at, timeZone).date);
  const dayStart = instantOf(today.date, 0, timeZone);
  let current: { window: IActiveWindow; endsAt: Date } | null = null;
  let endedAt: Date | null = null;

  for (const day of [addDays(today, -1), today]) {
    for (const window of windows) {
      if (!startsOn(window, day, closed)) {
        continue;
      }

      const { startsAt, endsAt } = windowSpan(window, day, timeZone);

      if (startsAt <= at && at < endsAt) {
        if (!current || endsAt > current.endsAt) {
          current = { window, endsAt };
        }
      } else if (endsAt <= at && endsAt >= dayStart) {
        if (!endedAt || endsAt > endedAt) {
          endedAt = endsAt;
        }
      }
    }
  }

  let startsAt: Date | null = null;

  for (let offset = 0; offset <= LOOKAHEAD_DAYS && !startsAt; offset++) {
    const day = addDays(today, offset);

    for (const window of windows) {
      if (!startsOn(window, day, closed)) {
        continue;
      }

      const start = windowSpan(window, day, timeZone).startsAt;

      if (start > at && (!startsAt || start < startsAt)) {
        startsAt = start;
      }
    }
  }

  return { current, startsAt, endedAt };
};

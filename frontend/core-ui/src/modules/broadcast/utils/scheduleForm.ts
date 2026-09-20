export const BROADCAST_EVERY_VALUES = [
  'once',
  'day',
  'week',
  'month',
  'year',
] as const;

export type TBroadcastEvery = (typeof BROADCAST_EVERY_VALUES)[number];

export type TBroadcastScheduleForm = {
  every: TBroadcastEvery;
  /** The moment for a one-off, or the time of day (and day) a repeat lands on. */
  at?: Date;
  endDate?: Date;
};

/** Kept inside every month, so a monthly repeat never skips February. */
export const MAX_MONTH_DAY = 28;

// A yearly repeat names its month, so the only day it may not reach is one a
// short year does not have — February's 29th.
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** The last day a repeat can land on, given how often it repeats. */
export const lastReachableDay = (schedule: TBroadcastScheduleForm) =>
  schedule.every === 'year' && schedule.at
    ? DAYS_IN_MONTH[schedule.at.getMonth()]
    : MAX_MONTH_DAY;

export const BROADCAST_EVERY_OPTIONS: {
  value: TBroadcastEvery;
  label: string;
}[] = [
  { value: 'once', label: 'Once' },
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

export const isRecurringForm = (schedule?: TBroadcastScheduleForm | null) =>
  !!schedule?.every && schedule.every !== 'once';

/**
 * Whether this schedule is complete enough to be accepted.
 *
 * A repeat needs somewhere to stop; nothing here is allowed to run forever.
 */
export const isScheduleReady = (schedule?: TBroadcastScheduleForm | null) => {
  const at = schedule?.at;

  if (!(at instanceof Date)) {
    return false;
  }

  if (!isRecurringForm(schedule)) {
    return at.getTime() > Date.now();
  }

  return schedule?.endDate instanceof Date;
};

/**
 * The schedule as the server takes it.
 *
 * A repeat is described by the one moment that was picked: its time of day
 * always, its weekday when repeating weekly, its date when repeating monthly.
 * One control set, read three ways, so there is nothing extra to fill in.
 */
export const toScheduleVariables = (schedule: TBroadcastScheduleForm) => {
  const at = schedule.at as Date;

  if (!isRecurringForm(schedule)) {
    return { dateTime: at };
  }

  return {
    recurrence: {
      every: schedule.every,
      hour: at.getHours(),
      minute: at.getMinutes(),
      weekDay: at.getDay(),
      monthDay: Math.min(at.getDate(), lastReachableDay(schedule)),
      monthOfYear: at.getMonth() + 1,
      // The day the repeat starts on, not only the time of day it reads off
      // it. Without it the first send lands before the moment that was picked.
      startDate: at,
      endDate: schedule.endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
};

/** When a campaign goes out if nobody says otherwise. */
const DEFAULT_SEND_HOUR = 9;

/**
 * Days picked on the calendar, read as a schedule.
 *
 * One day is one send; several days in a row are a daily repeat that stops on
 * the last of them — which is what dragging across a week means. Anything
 * else (weekly, monthly) is a change to make in the picker afterwards, with
 * the end date already filled in.
 */
export const scheduleFromRange = (
  start: Date,
  end: Date,
): TBroadcastScheduleForm => {
  const at = new Date(start);

  at.setHours(DEFAULT_SEND_HOUR, 0, 0, 0);

  // The chosen hour has already passed today, so the nearest whole hour ahead
  // stands in: a moment in the past is not a schedule.
  const soon = new Date();

  soon.setHours(soon.getHours() + 1, 0, 0, 0);

  const once = start.toDateString() === end.toDateString();
  const endDate = new Date(end);

  endDate.setHours(23, 59, 59, 999);

  return {
    every: once ? 'once' : 'day',
    at: at.getTime() > Date.now() ? at : soon,
    endDate: once ? undefined : endDate,
  };
};

type TStoredSchedule = {
  dateTime?: string | null;
  // Read back from the server, so widened to what a string field can hold.
  every?: string | null;
  hour?: number | null;
  minute?: number | null;
  weekDay?: number | null;
  monthDay?: number | null;
  monthOfYear?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * A stored schedule read back into the one moment the picker shows.
 *
 * The moment is rebuilt rather than kept, since a repeat has no single date —
 * only a time of day and, depending on how often it repeats, a weekday or a
 * day of the month.
 */
export const scheduleToForm = (
  stored?: TStoredSchedule | null,
): TBroadcastScheduleForm | undefined => {
  if (!stored) {
    return undefined;
  }

  if (!stored.every) {
    return stored.dateTime
      ? { every: 'once', at: new Date(stored.dateTime) }
      : undefined;
  }

  // The moment it was set up with, when there is one: it says both the time of
  // day and the day itself, which a rebuilt one can only guess at.
  const at = stored.startDate ? new Date(stored.startDate) : new Date();

  at.setHours(stored.hour ?? 9, stored.minute ?? 0, 0, 0);

  if (stored.startDate) {
    return {
      every: stored.every as TBroadcastEvery,
      at,
      endDate: stored.endDate ? new Date(stored.endDate) : undefined,
    };
  }

  if (stored.every === 'week' && typeof stored.weekDay === 'number') {
    at.setDate(at.getDate() + ((stored.weekDay - at.getDay() + 7) % 7));
  }

  if (stored.every === 'month' && typeof stored.monthDay === 'number') {
    at.setDate(stored.monthDay);
  }

  if (stored.every === 'year') {
    at.setMonth(
      (stored.monthOfYear ?? 1) - 1,
      typeof stored.monthDay === 'number' ? stored.monthDay : 1,
    );
  }

  return {
    every: stored.every as TBroadcastEvery,
    at,
    endDate: stored.endDate ? new Date(stored.endDate) : undefined,
  };
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** What one picked moment means once it is being repeated, in one line. */
export const describeRecurrence = (schedule: TBroadcastScheduleForm) => {
  const at = schedule.at;

  if (!at || !isRecurringForm(schedule)) {
    return '';
  }

  const time = `${String(at.getHours()).padStart(2, '0')}:${String(
    at.getMinutes(),
  ).padStart(2, '0')}`;

  if (schedule.every === 'week') {
    return `Every ${WEEKDAYS[at.getDay()]} at ${time}`;
  }

  if (schedule.every === 'month') {
    return `Day ${Math.min(
      at.getDate(),
      MAX_MONTH_DAY,
    )} of every month at ${time}`;
  }

  if (schedule.every === 'year') {
    const day = Math.min(at.getDate(), lastReachableDay(schedule));

    return `Every ${day} ${MONTHS[at.getMonth()]} at ${time}`;
  }

  return `Every day at ${time}`;
};

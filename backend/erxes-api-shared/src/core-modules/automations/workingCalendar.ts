import {
  shiftZonedDays,
  ZonedDate,
  zonedDate,
  zonedDayStart,
} from '../segments/zonedTime';

/**
 * A branch's working hours as Settings → Structure stores them: one entry per
 * working weekday (`inactive: false`), lunch excluded, and holidays that close
 * a period or shorten it (`startFrom`/`endTo`). Wall-clock times are read in
 * the organization's time zone.
 */
export type TWorkingDay = {
  inactive?: boolean;
  startFrom?: string;
  endTo?: string;
  lunchStartFrom?: string;
  lunchEndTo?: string;
};

export type TWorkingHoliday = {
  startDate?: string;
  endDate?: string;
  inactive?: boolean;
  startFrom?: string;
  endTo?: string;
};

export type TWorkingCalendar = {
  timeZone: string;
  workhours?: Record<string, TWorkingDay | null | undefined> | null;
  holidays?: TWorkingHoliday[] | null;
};

const WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MINUTE = 60_000;

// Bounds the day-by-day walk; a calendar that is closed this long is a mistake.
const SEARCH_DAYS = 400;

type TWindow = [number, number];

const toMinutes = (time?: string): number | undefined => {
  const match = /^(\d{1,2}):(\d{2})$/.exec((time || '').trim());

  if (!match) {
    return undefined;
  }

  const minutes = Number(match[1]) * 60 + Number(match[2]);

  return minutes >= 0 && minutes <= 24 * 60 ? minutes : undefined;
};

const dayKey = ({ year, month, day }: ZonedDate) => year * 10000 + month * 100 + day;

const toZonedDate = (value: string | undefined, timeZone: string) => {
  if (!value) {
    return undefined;
  }

  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (plain) {
    return { year: Number(plain[1]), month: Number(plain[2]), day: Number(plain[3]) };
  }

  const instant = new Date(value);

  return Number.isNaN(instant.getTime()) ? undefined : zonedDate(instant, timeZone);
};

const spanWindow = (from?: string, to?: string): TWindow | undefined => {
  const start = toMinutes(from);
  const end = toMinutes(to);

  return start !== undefined && end !== undefined && end > start
    ? [start, end]
    : undefined;
};

const isWorkingDay = (day?: TWorkingDay | null) =>
  !!day && day.inactive === false && !!spanWindow(day.startFrom, day.endTo);

/** Whether the calendar has any working time at all; one that has none is ignored. */
export const hasWorkingTime = (calendar?: TWorkingCalendar | null) =>
  !!calendar?.workhours &&
  WEEK_DAYS.some((name) => isWorkingDay(calendar.workhours?.[name]));

const holidayOn = (calendar: TWorkingCalendar, date: ZonedDate) => {
  const key = dayKey(date);

  return (calendar.holidays || []).find((holiday) => {
    if (!holiday || holiday.inactive) {
      return false;
    }

    const start = toZonedDate(holiday.startDate, calendar.timeZone);
    const end = toZonedDate(holiday.endDate || holiday.startDate, calendar.timeZone);

    return !!start && !!end && dayKey(start) <= key && key <= dayKey(end);
  });
};

/** The working spans of one local day, in minutes after midnight. */
export const workingWindowsOn = (
  calendar: TWorkingCalendar,
  date: ZonedDate,
): TWindow[] => {
  const holiday = holidayOn(calendar, date);

  if (holiday) {
    const span = spanWindow(holiday.startFrom, holiday.endTo);

    return span ? [span] : [];
  }

  const weekDay = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  const day = calendar.workhours?.[WEEK_DAYS[weekDay]];

  if (!isWorkingDay(day)) {
    return [];
  }

  const [start, end] = spanWindow(day?.startFrom, day?.endTo) as TWindow;
  const lunch = spanWindow(day?.lunchStartFrom, day?.lunchEndTo);

  if (!lunch || lunch[1] <= start || lunch[0] >= end) {
    return [[start, end]];
  }

  return [
    [start, Math.max(start, lunch[0])],
    [Math.min(end, lunch[1]), end],
  ].filter(([from, to]) => to > from) as TWindow[];
};

const eachWindow = function* (calendar: TWorkingCalendar, from: Date) {
  const firstDay = zonedDate(from, calendar.timeZone);

  for (let offset = 0; offset < SEARCH_DAYS; offset++) {
    const date = shiftZonedDays(firstDay, offset);
    const dayStart = zonedDayStart(date, calendar.timeZone).getTime();

    for (const [start, end] of workingWindowsOn(calendar, date)) {
      yield { start: dayStart + start * MINUTE, end: dayStart + end * MINUTE };
    }
  }
};

/**
 * The first working moment at or after `at`. A calendar with no working time
 * says nothing, so `at` comes back unchanged.
 */
export const nextWorkingMoment = (
  calendar: TWorkingCalendar | null | undefined,
  at: Date,
): Date => {
  if (!calendar || !hasWorkingTime(calendar)) {
    return at;
  }

  const time = at.getTime();

  for (const window of eachWindow(calendar, at)) {
    if (time < window.end) {
      return new Date(Math.max(time, window.start));
    }
  }

  return at;
};

export const isWorkingMoment = (
  calendar: TWorkingCalendar | null | undefined,
  at: Date,
) => nextWorkingMoment(calendar, at).getTime() === at.getTime();

/**
 * `at` plus `minutes` of working time: only open hours count, lunch and
 * holidays do not. Without working time it is plain clock time.
 */
export const addWorkingTime = (
  calendar: TWorkingCalendar | null | undefined,
  at: Date,
  minutes: number,
): Date => {
  if (!calendar || !hasWorkingTime(calendar)) {
    return new Date(at.getTime() + minutes * MINUTE);
  }

  let remaining = Math.max(0, minutes) * MINUTE;
  let cursor = at.getTime();

  for (const window of eachWindow(calendar, at)) {
    if (cursor >= window.end) {
      continue;
    }

    const start = Math.max(cursor, window.start);
    const available = window.end - start;

    if (remaining <= available) {
      return new Date(start + remaining);
    }

    remaining -= available;
    cursor = window.end;
  }

  return new Date(cursor + remaining);
};

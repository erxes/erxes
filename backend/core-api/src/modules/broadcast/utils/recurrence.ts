import {
  shiftZonedDays,
  ZonedDate,
  zonedDate,
  zonedDayStart,
} from 'erxes-api-shared/core-modules';

export type TBroadcastEvery = 'day' | 'week' | 'month' | 'year';

export type TBroadcastRecurrence = {
  every?: TBroadcastEvery | null;
  hour?: number | null;
  minute?: number | null;
  /** 0–6, Sunday first. Only read when repeating weekly. */
  weekDay?: number | null;
  /** 1–28 when repeating monthly, so no month is ever skipped; up to that
   * month's own length when repeating yearly, where the month is fixed. */
  monthDay?: number | null;
  /** 1–12. Only read when repeating yearly. */
  monthOfYear?: number | null;
  /** The first day the pattern may land on. Absent means "from now on". */
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  timeZone?: string | null;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** A year of days is always enough to find the next weekly or monthly slot. */
const SEARCH_DAYS = 366;

/** Counting stops here; a schedule this long is a mistake, not an intention. */
const MAX_OCCURRENCES = 2000;

const weekDayOf = ({ year, month, day }: ZonedDate) =>
  new Date(Date.UTC(year, month - 1, day)).getUTCDay();

const fitsPattern = (day: ZonedDate, schedule: TBroadcastRecurrence) => {
  if (schedule.every === 'week') {
    return weekDayOf(day) === (schedule.weekDay ?? 1);
  }

  if (schedule.every === 'month') {
    return day.day === (schedule.monthDay ?? 1);
  }

  if (schedule.every === 'year') {
    return (
      day.month === (schedule.monthOfYear ?? 1) &&
      day.day === (schedule.monthDay ?? 1)
    );
  }

  return true;
};

/**
 * The instant a given day's slot falls on.
 *
 * Built from the zone's own midnight rather than from UTC, so the campaign
 * keeps going out at the same wall-clock time. A zone that shifts its clock
 * between midnight and the chosen hour moves that day's send by an hour, twice
 * a year — deliberately not corrected for, since the alternative is a great
 * deal of machinery for an hour's difference on a broadcast.
 */
const momentOn = (
  day: ZonedDate,
  schedule: TBroadcastRecurrence,
  timeZone: string,
) =>
  new Date(
    zonedDayStart(day, timeZone).getTime() +
      (schedule.hour ?? 0) * HOUR +
      (schedule.minute ?? 0) * MINUTE,
  );

/**
 * When this schedule next comes due after a given instant.
 *
 * `undefined` means the schedule is over — either it has no pattern, or its
 * end date has passed. That is what breaks the chain: an occurrence arms the
 * next one, and the first one with no answer simply stops arming.
 */
export const nextOccurrence = (
  schedule: TBroadcastRecurrence,
  after: Date,
): Date | undefined => {
  if (!schedule.every) {
    return undefined;
  }

  const timeZone = schedule.timeZone || 'UTC';
  const startsAt = schedule.startDate
    ? new Date(schedule.startDate).getTime()
    : undefined;

  // A repeat set up for later starts later. Without this the search began at
  // "now" and the first occurrence landed before the day that was chosen.
  const searchFrom =
    startsAt !== undefined && startsAt > after.getTime()
      ? new Date(startsAt - 1)
      : after;

  const from = zonedDate(searchFrom, timeZone);
  const endsAt = schedule.endDate
    ? new Date(schedule.endDate).getTime()
    : undefined;

  for (let ahead = 0; ahead <= SEARCH_DAYS; ahead++) {
    const day = ahead === 0 ? from : shiftZonedDays(from, ahead);

    if (!fitsPattern(day, schedule)) {
      continue;
    }

    const at = momentOn(day, schedule, timeZone);

    if (at.getTime() <= searchFrom.getTime()) {
      continue;
    }

    if (endsAt !== undefined && at.getTime() > endsAt) {
      return undefined;
    }

    return at;
  }

  return undefined;
};

/**
 * How many times this schedule will still fire.
 *
 * Shown before the schedule is accepted, so an end date stops being an
 * abstract date and becomes "this goes out 53 times".
 */
export const occurrenceCount = (
  schedule: TBroadcastRecurrence,
  after: Date = new Date(),
): number => {
  let at = nextOccurrence(schedule, after);
  let count = 0;

  while (at && count < MAX_OCCURRENCES) {
    count++;
    at = nextOccurrence(schedule, at);
  }

  return count;
};

// The same chain the scheduler arms one link at a time, so a calendar and the
// alarms it draws cannot disagree.
export const occurrencesBetween = (
  schedule: TBroadcastRecurrence,
  from: Date,
  to: Date,
  limit: number = MAX_OCCURRENCES,
): Date[] => {
  const found: Date[] = [];
  // An occurrence landing exactly on `from` belongs inside the window.
  let at = nextOccurrence(schedule, new Date(from.getTime() - 1));

  while (at && at.getTime() <= to.getTime() && found.length < limit) {
    found.push(at);
    at = nextOccurrence(schedule, at);
  }

  return found;
};

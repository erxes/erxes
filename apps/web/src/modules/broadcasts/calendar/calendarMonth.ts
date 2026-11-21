import type { Broadcast, UpcomingRun } from '@erxes/core-contract';
import {
  addDays,
  addMonths,
  format,
  isSameMonth,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { zonedDay, zonedDayStart } from '~/lib/timeZones';

/** Monday, as every other week drawn in erxes. */
const WEEK_STARTS_ON = 1;

const DAYS_IN_WEEK = 7;

/** Always six rows, so the cells don't move under the pointer from one month to the next. */
const WEEKS_SHOWN = 6;

/** Entries a day shows before the rest go behind "+N more". */
const ENTRIES_PER_DAY = 3;

/** What a day shows: a broadcast, or a run of a recurring one that isn't made yet. */
export interface CalendarEntry {
  key: string;
  /** The broadcast it opens: itself, or the recurring broadcast an upcoming run belongs to. */
  id: string;
  name: string;
  channel: Broadcast['channel'];
  status: Broadcast['status'] | 'upcoming';
  at: string;
}

export interface CalendarDay {
  date: Date;
  key: string;
  /** In the month shown, not the weeks around it. */
  inMonth: boolean;
  isToday: boolean;
  entries: CalendarEntry[];
  visible: CalendarEntry[];
  hiddenCount: number;
}

/** When a broadcast went or goes out; a draft with no schedule has no day. */
const goesAt = (broadcast: Broadcast) => broadcast.startedAt ?? broadcast.scheduledAt;

/** The broadcasts with a day, and the upcoming runs of recurring ones. */
export const calendarEntries = (broadcasts: Broadcast[], upcoming: UpcomingRun[]) => [
  ...broadcasts.flatMap((broadcast): CalendarEntry[] => {
    const at = goesAt(broadcast);

    return at ? [{ key: broadcast.id, ...broadcast, at }] : [];
  }),
  ...upcoming.map((run): CalendarEntry => ({
    key: `${run.broadcastId}:${run.at}`,
    id: run.broadcastId,
    name: run.name,
    channel: run.channel,
    status: 'upcoming',
    at: run.at,
  })),
];

/** A `yyyy-MM` link, else the current month. */
export const parseMonth = (value: string | null) => {
  const parsed = value ? parse(value, 'yyyy-MM', new Date()) : undefined;

  return startOfMonth(parsed && isValid(parsed) ? parsed : new Date());
};

export const monthParam = (month: Date) => format(month, 'yyyy-MM');

export const shiftMonth = addMonths;

const gridStart = (month: Date) =>
  startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

/**
 * The days the grid draws, wider than the month: the leading and trailing days carry theirs too.
 * Each day is the organisation's (`zone`), midnight to midnight.
 */
export const monthWindow = (month: Date, zone: string) => {
  const from = gridStart(month);

  return {
    from: zonedDayStart(dayKey(from), zone).toISOString(),
    to: zonedDayStart(dayKey(addDays(from, WEEKS_SHOWN * DAYS_IN_WEEK)), zone).toISOString(),
  };
};

/** The first week's days, for the weekday names. */
export const weekDays = (month: Date) =>
  Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(gridStart(month), index));

/** The month as 42 cells, each with the entries that fall on it in `zone`, earliest first. */
export const buildMonthGrid = (month: Date, all: CalendarEntry[], today: Date, zone: string) => {
  const byDay = new Map<string, CalendarEntry[]>();
  const todayKey = zonedDay(today, zone);

  for (const entry of all.toSorted((a, b) => a.at.localeCompare(b.at))) {
    const key = zonedDay(entry.at, zone);

    byDay.set(key, [...(byDay.get(key) ?? []), entry]);
  }

  return Array.from({ length: WEEKS_SHOWN * DAYS_IN_WEEK }, (_, index): CalendarDay => {
    const date = addDays(gridStart(month), index);
    const key = dayKey(date);
    const entries = byDay.get(key) ?? [];

    return {
      date,
      key,
      inMonth: isSameMonth(date, month),
      isToday: key === todayKey,
      entries,
      visible: entries.slice(0, ENTRIES_PER_DAY),
      hiddenCount: Math.max(entries.length - ENTRIES_PER_DAY, 0),
    };
  });
};

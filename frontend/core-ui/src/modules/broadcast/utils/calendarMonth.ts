import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

/** Monday, as everywhere else a week is drawn in this product. */
const WEEK_STARTS_ON = 1;

const DAYS_IN_WEEK = 7;

/**
 * Always six rows, whatever the month needs.
 *
 * A grid that grows a row for a 31-day month starting on Sunday moves every
 * cell under the pointer, which is worse than one empty week.
 */
const WEEKS_SHOWN = 6;

/**
 * How many chips a cell shows before the rest goes behind one line.
 *
 * Two, because a cell is a sixth of the grid's height however tall the window
 * is: a third chip fits on a large screen and is clipped on a laptop, and a
 * campaign half cut off is worse than one honestly counted as "+3 more".
 */
const ENTRIES_PER_DAY = 2;

export type TCalendarEntry = {
  engageMessageId: string;
  title?: string | null;
  method?: string | null;
  at: string;
  state: string;
  runId?: string | null;
  runCount?: number | null;
  totalCount?: number | null;
};

export type TCalendarDay = {
  date: Date;
  key: string;
  /** Belongs to the month being shown, rather than to the weeks around it. */
  inMonth: boolean;
  isToday: boolean;
  entries: TCalendarEntry[];
  /** What the cell has room for, and how much it is keeping back. */
  visible: TCalendarEntry[];
  hiddenCount: number;
};

/** A local calendar day. Two campaigns on one date share it, whatever the time. */
const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const monthLabel = (month: Date) => format(month, 'MMMM yyyy');

export const monthParam = (month: Date) => format(month, 'yyyy-MM');

/** A `YYYY-MM` link, falling back to the month being lived in. */
export const parseMonth = (value?: string | null): Date => {
  const parsed = value ? new Date(`${value}-01T00:00:00`) : undefined;

  return parsed && !Number.isNaN(parsed.getTime())
    ? startOfMonth(parsed)
    : startOfMonth(new Date());
};

export const shiftMonth = (month: Date, by: number) => addMonths(month, by);

export const isCurrentMonth = (month: Date) => isSameMonth(month, new Date());

const gridStart = (month: Date) =>
  startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });

/**
 * The window the grid actually covers, which is wider than the month: the
 * trailing and leading days are drawn, so they have to carry their campaigns.
 */
export const monthWindow = (month: Date) => {
  const from = gridStart(month);

  // Ends on the last cell's final instant, so nothing is fetched that has no
  // cell to land in and yet would still be counted.
  const to = new Date(addDays(from, WEEKS_SHOWN * DAYS_IN_WEEK).getTime() - 1);

  return { from, to };
};

export const weekdayLabels = (): string[] => {
  const start = gridStart(new Date());

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    format(addDays(start, index), 'EEE'),
  );
};

/**
 * The month as cells, each holding what falls on it.
 *
 * Grouped once here rather than filtered per cell: a month of a daily campaign
 * is a few hundred entries, and asking each of forty-two cells to walk all of
 * them is the kind of thing that only shows up on someone else's machine.
 */
export const buildMonthGrid = (
  month: Date,
  entries: TCalendarEntry[],
): TCalendarDay[] => {
  const byDay = new Map<string, TCalendarEntry[]>();

  for (const entry of entries) {
    const key = dayKey(new Date(entry.at));
    const day = byDay.get(key);

    if (day) {
      day.push(entry);
    } else {
      byDay.set(key, [entry]);
    }
  }

  const start = gridStart(month);
  const today = new Date();

  return Array.from({ length: WEEKS_SHOWN * DAYS_IN_WEEK }, (_, index) => {
    const date = addDays(start, index);
    const key = dayKey(date);
    const dayEntries = byDay.get(key) || [];

    return {
      date,
      key,
      inMonth: isSameMonth(date, month),
      isToday: isSameDay(date, today),
      entries: dayEntries,
      visible: dayEntries.slice(0, ENTRIES_PER_DAY),
      hiddenCount: Math.max(dayEntries.length - ENTRIES_PER_DAY, 0),
    };
  });
};

export type TDayRange = { start: Date; end: Date };

/** A day as a link carries it. */
export const dayParam = (date: Date) => format(date, 'yyyy-MM-dd');

export const parseDay = (value?: string | null): Date | undefined => {
  const parsed = value ? new Date(`${value}T00:00:00`) : undefined;

  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
};

/**
 * Two days as a range, whichever was picked first.
 *
 * A selection is dragged in both directions, so the pair is ordered here
 * rather than by everything that reads it.
 */
export const orderRange = (first: Date, second: Date): TDayRange =>
  first.getTime() <= second.getTime()
    ? { start: startOfDay(first), end: endOfDay(second) }
    : { start: startOfDay(second), end: endOfDay(first) };

export const isSameRange = (a?: TDayRange | null, b?: TDayRange | null) =>
  !!a &&
  !!b &&
  a.start.getTime() === b.start.getTime() &&
  a.end.getTime() === b.end.getTime();

export const isInRange = (date: Date, range?: TDayRange | null) =>
  !!range &&
  date.getTime() >= range.start.getTime() &&
  date.getTime() <= range.end.getTime();

export const rangeDays = (range: TDayRange) =>
  differenceInCalendarDays(range.end, range.start) + 1;

/** Nothing can be planned into days that have already gone. */
export const isRangePast = (range: TDayRange) =>
  range.end.getTime() < Date.now();

export const rangeLabel = (range: TDayRange) =>
  isSameDay(range.start, range.end)
    ? format(range.start, 'd MMM')
    : `${format(range.start, 'd MMM')} – ${format(range.end, 'd MMM')}`;

type TEntryDisplay = { dot: string; chip: string; labelKey: string };

/**
 * What a moment on the calendar is, in a colour and a word.
 *
 * Only the theme's own states are used, so a campaign reads the same here as
 * it does in its badge on the list. Each chip is tinted with its own state at
 * a tenth: a dot alone left the entries dissolving into the grid, and a solid
 * fill would turn a busy month into a colour chart.
 */
const ENTRY_STATE_DISPLAY: Record<string, TEntryDisplay> = {
  planned: {
    dot: 'bg-primary',
    chip: 'bg-primary/10 hover:bg-primary/20',
    labelKey: 'trigger.scheduled',
  },
  overdue: {
    dot: 'bg-warning',
    chip: 'bg-warning/15 hover:bg-warning/25',
    labelKey: 'status.overdue',
  },
  running: {
    dot: 'bg-info',
    chip: 'bg-info/10 hover:bg-info/20',
    labelKey: 'status.sending',
  },
  completed: {
    dot: 'bg-success',
    chip: 'bg-success/10 hover:bg-success/20',
    labelKey: 'status.sent',
  },
  failed: {
    dot: 'bg-destructive',
    chip: 'bg-destructive/10 hover:bg-destructive/20',
    labelKey: 'status.failed',
  },
  cancelled: {
    dot: 'bg-muted-foreground',
    chip: 'bg-muted hover:bg-accent',
    labelKey: 'status.cancelled',
  },
};

export const calendarEntryDisplay = (state: string): TEntryDisplay =>
  ENTRY_STATE_DISPLAY[state] ?? {
    dot: 'bg-muted-foreground',
    chip: 'bg-muted hover:bg-accent',
    labelKey: 'status.unknown',
  };

export const entryTime = (entry: TCalendarEntry) =>
  format(new Date(entry.at), 'HH:mm');

// A one-line account of an entry, for the tooltip a chip has no room for.
export const entrySummary = (
  entry: TCalendarEntry,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  const { labelKey } = calendarEntryDisplay(entry.state);
  const recipients = entry.totalCount;

  return typeof recipients === 'number' && recipients > 0
    ? `${t(labelKey)} · ${t('calendar.recipients', {
        count: recipients,
      })}`
    : t(labelKey);
};

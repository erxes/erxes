import {
  formatExecutionDuration,
  getExecutionActionStatus,
  TExecutionStatus,
} from '@/automations/utils/automationHistoryUtils/executionFormat';
import { IAutomationHistory, IAutomationHistoryAction } from 'ui-modules';

// `actions` arrives as a JSON scalar, so `queuedAt` is on the row even though
// the shared type does not declare it.
type TTimelineSourceAction = IAutomationHistoryAction & {
  actionTypeLabel: string;
  queuedAt?: Date | string;
};

// Left offset and width, both as a percentage of the track.
export type TTimelineBar = { left: number; width: number };

export type TTimelineRow = {
  key: string;
  action: IAutomationHistoryAction;
  label: string;
  status: TExecutionStatus;
  startedAt: number;
  durationMs: number;
  run: TTimelineBar;
  // Deferred actions: time between the handoff and the owning plugin's reply.
  queue?: TTimelineBar;
  queuedMs?: number;
  // Not finished when the execution was read, so it runs on to "now".
  pending?: TTimelineBar;
};

export type TTimelineGap = TTimelineBar & { durationMs: number };
export type TTimelineTick = { left: number; offsetMs: number };

export type TExecutionTimeline = {
  rows: TTimelineRow[];
  run: TTimelineBar;
  gaps: TTimelineGap[];
  ticks: TTimelineTick[];
  totalMs: number;
  isRunning: boolean;
  errorCount: number;
  retryCount: number;
};

type TPiece = {
  from: number;
  to: number;
  collapsed: boolean;
  left: number;
  width: number;
};

const RUNNING_EXECUTION_STATUSES = ['active', 'waiting', 'standby'];
const DEFERRED_STATUSES: TExecutionStatus[] = ['queued', 'standby'];
// A delay step can idle for days while the steps around it take
// milliseconds, so idle time this long is drawn at a fixed width instead.
const MIN_COLLAPSE_MS = 2000;
const COLLAPSED_GAP_PERCENT = 6;
const MIN_TICK_SPACING_PERCENT = 10;

const toTime = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
};

export const formatTimelineDuration = (durationMs: number) => {
  if (durationMs < 60_000) {
    return formatExecutionDuration(Math.round(durationMs));
  }

  const units: [string, number][] = [
    ['d', 86_400_000],
    ['h', 3_600_000],
    ['m', 60_000],
    ['s', 1000],
  ];
  const parts: string[] = [];
  let rest = durationMs;

  for (const [unit, size] of units) {
    const value = Math.floor(rest / size);
    if (value > 0 || parts.length) {
      parts.push(`${value}${unit}`);
    }
    rest -= value * size;
    if (parts.length === 2) {
      break;
    }
  }

  return parts.join(' ');
};

type TSpan = {
  action: TTimelineSourceAction;
  index: number;
  status: TExecutionStatus;
  start: number;
  runEnd: number;
  queueEnd?: number;
  pendingEnd?: number;
};

const toSpan = (
  action: TTimelineSourceAction,
  index: number,
  now: number,
  isLastWaiting: boolean,
): TSpan | null => {
  const start = toTime(action.startedAt) ?? toTime(action.createdAt);
  if (start === undefined) {
    return null;
  }

  const status = getExecutionActionStatus(action);
  const queuedAt = toTime(action.queuedAt);
  const handoff =
    queuedAt !== undefined && queuedAt >= start ? queuedAt : undefined;
  const finish =
    toTime(action.finishedAt) ??
    (typeof action.durationMs === 'number'
      ? start + action.durationMs
      : undefined);

  if (finish === undefined) {
    const runEnd = handoff ?? start;
    return {
      action,
      index,
      status,
      start,
      runEnd,
      pendingEnd: DEFERRED_STATUSES.includes(status) ? now : undefined,
    };
  }

  return {
    action,
    index,
    status,
    start,
    runEnd: handoff ?? finish,
    queueEnd: handoff !== undefined ? finish : undefined,
    pendingEnd: isLastWaiting ? now : undefined,
  };
};

const spanEnd = (span: TSpan) =>
  Math.max(span.runEnd, span.queueEnd ?? 0, span.pendingEnd ?? 0);

/**
 * Splits the run into busy and idle pieces and gives each a share of the
 * track: idle pieces longer than everything the run actually did get a fixed
 * width, the rest share the remaining width in proportion to their time.
 */
const buildPieces = (startAt: number, endAt: number, spans: TSpan[]) => {
  const intervals = spans
    .map((span) => [span.start, spanEnd(span)] as const)
    .sort((a, b) => a[0] - b[0]);

  const busy: [number, number][] = [];
  for (const [from, to] of intervals) {
    const last = busy.at(-1);
    if (last && from <= last[1]) {
      last[1] = Math.max(last[1], to);
    } else {
      busy.push([from, to]);
    }
  }

  const busyMs = busy.reduce((sum, [from, to]) => sum + (to - from), 0);
  const collapseAbove = Math.max(MIN_COLLAPSE_MS, busyMs);

  const pieces: Omit<TPiece, 'left' | 'width'>[] = [];
  let cursor = startAt;
  for (const [from, to] of busy) {
    if (from > cursor) {
      pieces.push({
        from: cursor,
        to: from,
        collapsed: from - cursor > collapseAbove,
      });
    }
    pieces.push({ from: Math.max(from, cursor), to, collapsed: false });
    cursor = Math.max(cursor, to);
  }
  if (endAt > cursor) {
    pieces.push({
      from: cursor,
      to: endAt,
      collapsed: endAt - cursor > collapseAbove,
    });
  }

  const collapsedCount = pieces.filter(({ collapsed }) => collapsed).length;
  const collapsedWidth = collapsedCount
    ? Math.min(COLLAPSED_GAP_PERCENT, 30 / collapsedCount)
    : 0;
  const expandedMs = pieces
    .filter(({ collapsed }) => !collapsed)
    .reduce((sum, { from, to }) => sum + (to - from), 0);
  const expandedWidth = 100 - collapsedCount * collapsedWidth;

  let left = 0;
  return pieces.map((piece): TPiece => {
    const width = piece.collapsed
      ? collapsedWidth
      : expandedMs
      ? ((piece.to - piece.from) / expandedMs) * expandedWidth
      : 0;
    const placed = { ...piece, left, width };
    left += width;
    return placed;
  });
};

const toPosition = (pieces: TPiece[], time: number) => {
  for (const piece of pieces) {
    if (time <= piece.to) {
      const length = piece.to - piece.from;
      const ratio = length > 0 ? Math.max(0, time - piece.from) / length : 0;
      return piece.left + ratio * piece.width;
    }
  }
  return 100;
};

export const buildExecutionTimeline = (
  execution: IAutomationHistory,
  actions: TTimelineSourceAction[],
  now: number,
): TExecutionTimeline => {
  const isRunning = RUNNING_EXECUTION_STATUSES.includes(execution.status);
  // A run parked on a delay keeps waiting after that step wrote its row.
  const lastWaitingIndex =
    execution.status === 'waiting'
      ? actions.reduce(
          (found, action, index) =>
            getExecutionActionStatus(action) === 'waiting' ? index : found,
          -1,
        )
      : -1;

  const spans = actions
    .map((action, index) =>
      toSpan(action, index, now, index === lastWaitingIndex),
    )
    .filter((span): span is TSpan => span !== null);

  const startAt = Math.min(
    toTime(execution.createdAt) ?? Infinity,
    ...spans.map(({ start }) => start),
  );
  const endAt = Math.max(
    startAt,
    ...spans.map(spanEnd),
    isRunning ? now : startAt,
  );

  if (!Number.isFinite(startAt)) {
    return {
      rows: [],
      run: { left: 0, width: 0 },
      gaps: [],
      ticks: [],
      totalMs: 0,
      isRunning,
      errorCount: 0,
      retryCount: 0,
    };
  }

  const pieces = buildPieces(startAt, endAt, spans);
  const bar = (from: number, to: number): TTimelineBar => {
    const left = toPosition(pieces, from);
    return { left, width: Math.max(0, toPosition(pieces, to) - left) };
  };

  const rows = spans.map((span): TTimelineRow => {
    const end = span.queueEnd ?? span.runEnd;
    return {
      key: `${span.action.actionId}-${span.action.attempt ?? 1}-${span.index}`,
      action: span.action,
      label: span.action.actionTypeLabel,
      status: span.status,
      startedAt: span.start,
      durationMs: end - span.start,
      run: bar(span.start, span.runEnd),
      queue:
        span.queueEnd !== undefined
          ? bar(span.runEnd, span.queueEnd)
          : undefined,
      queuedMs:
        span.queueEnd !== undefined ? span.queueEnd - span.runEnd : undefined,
      pending:
        span.pendingEnd !== undefined ? bar(end, span.pendingEnd) : undefined,
    };
  });

  const ticks: TTimelineTick[] = [];
  for (const piece of pieces) {
    const previous = ticks.at(-1);
    if (
      !piece.collapsed &&
      piece.to > piece.from &&
      (!previous || piece.left - previous.left >= MIN_TICK_SPACING_PERCENT)
    ) {
      ticks.push({ left: piece.left, offsetMs: piece.from - startAt });
    }
  }

  return {
    rows,
    run: { left: 0, width: 100 },
    gaps: pieces
      .filter(({ collapsed }) => collapsed)
      .map(({ left, width, from, to }) => ({
        left,
        width,
        durationMs: to - from,
      })),
    ticks,
    totalMs: endAt - startAt,
    isRunning,
    errorCount: rows.filter(({ status }) => status === 'error').length,
    retryCount: rows.filter(({ action }) => (action.attempt ?? 1) > 1).length,
  };
};

import {
  useAutomationExecutionTimeline,
  useAutomationTimelineRow,
} from '@/automations/components/builder/history/hooks/useAutomationExecutionTimeline';
import { TExecutionStatus } from '@/automations/utils/automationHistoryUtils/executionFormat';
import {
  formatTimelineDuration,
  TExecutionTimeline,
  TTimelineBar,
  TTimelineRow,
} from '@/automations/utils/automationHistoryUtils/executionTimeline';
import { IconArrowsSplit2, IconRefresh } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, cn, IconComponent, Skeleton, Tooltip } from 'erxes-ui';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

// Success is the normal case, so it stays neutral and colour is left for what
// needs a look: failures, deferred work and the selected step.
const BAR_CLASS: Record<TExecutionStatus, string> = {
  success: 'bg-foreground/20',
  error: 'bg-destructive',
  skipped: 'bg-foreground/10',
  waiting: 'bg-warning',
  queued: 'bg-warning',
  standby: 'bg-warning',
  dropped: 'bg-foreground/10',
};
const NEUTRAL_STATUSES: TExecutionStatus[] = ['success', 'skipped', 'dropped'];

const ROW_GRID = 'grid grid-cols-[16rem_1fr]';
const BAR = 'absolute top-1/2 h-3.5 -translate-y-1/2 rounded-md';

const barClass = (status: TExecutionStatus, isSelected: boolean) =>
  isSelected && NEUTRAL_STATUSES.includes(status)
    ? 'bg-primary'
    : BAR_CLASS[status];

const barStyle = ({ left, width }: TTimelineBar): CSSProperties => ({
  left: `${left}%`,
  width: `${width}%`,
});

// Near the right edge the label goes before the bar so it is not clipped.
const labelStyle = (row: TTimelineRow): CSSProperties => {
  const last = row.pending ?? row.queue ?? row.run;
  const end = last.left + last.width;
  return end > 85
    ? { right: `${100 - row.run.left}%`, marginRight: 8 }
    : { left: `${end}%`, marginLeft: 8 };
};

const TimelineStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-24 flex-col gap-0.5 border-r px-4 py-2 last:border-r-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-lg font-semibold tabular-nums">{value}</span>
  </div>
);

const TimelineNodeIcon = ({ name }: { name?: string }) => (
  <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
    <IconComponent name={name || 'IconBolt'} className="size-3.5" />
  </span>
);

// Draws the tree branch from the whole-run row down to each step.
const TimelineTreeBranch = ({ isLast }: { isLast: boolean }) => (
  <span className="relative h-full w-3 shrink-0">
    <span
      className={cn(
        'absolute left-0 top-0 border-l',
        isLast ? 'h-1/2' : 'h-full',
      )}
    />
    <span className="absolute left-0 top-1/2 w-full border-t" />
  </span>
);

// Grid lines, collapsed idle time and the end marker, drawn once behind all
// rows so the rows themselves stay borderless.
const TimelineGuides = ({ timeline }: { timeline: TExecutionTimeline }) => (
  <div className="pointer-events-none absolute inset-y-0 left-[calc(16rem+1rem)] right-4">
    {timeline.ticks.map((tick) => (
      <span
        key={tick.left}
        className="absolute inset-y-0 border-l border-border/70"
        style={{ left: `${tick.left}%` }}
      />
    ))}
    {timeline.gaps.map((gap) => (
      <span
        key={gap.left}
        className="absolute inset-y-0 border-x border-dashed bg-muted/50"
        style={barStyle(gap)}
      />
    ))}
    <span className="absolute inset-y-0 right-0 border-r border-foreground/40" />
  </div>
);

const TimelineAxis = ({ timeline }: { timeline: TExecutionTimeline }) => (
  <div className="relative mx-4 h-full">
    {timeline.ticks.map((tick) => (
      <span
        key={tick.left}
        className="absolute top-1/2 -translate-y-1/2 pl-1.5 text-xs text-muted-foreground tabular-nums"
        style={{ left: `${tick.left}%` }}
      >
        {tick.offsetMs ? formatTimelineDuration(tick.offsetMs) : '0'}
      </span>
    ))}
    {timeline.gaps.map((gap) => (
      <span
        key={gap.left}
        className="absolute top-1/2 -translate-y-1/2 truncate text-center text-xs text-muted-foreground"
        style={barStyle(gap)}
      >
        ⋯ {formatTimelineDuration(gap.durationMs)}
      </span>
    ))}
    <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background tabular-nums">
      {formatTimelineDuration(timeline.totalMs)}
    </span>
  </div>
);

const TimelineBarTooltip = ({ row }: { row: TTimelineRow }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-medium">{row.label}</span>
      <span>
        {t('history-timeline-started')}:{' '}
        {format(row.startedAt, 'yyyy-MM-dd HH:mm:ss.SSS')}
      </span>
      <span>
        {t('history-timeline-duration')}:{' '}
        {formatTimelineDuration(row.durationMs)}
      </span>
      {row.queuedMs !== undefined && (
        <span>
          {t('history-timeline-in-queue')}:{' '}
          {formatTimelineDuration(row.queuedMs)}
        </span>
      )}
      {row.pending && <span>{t('history-timeline-still-running')}</span>}
    </div>
  );
};

const TimelineTrack = ({
  row,
  isSelected,
}: {
  row: TTimelineRow;
  isSelected: boolean;
}) => (
  <div className="relative mx-4 h-full">
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span
          className={cn(BAR, 'min-w-1', barClass(row.status, isSelected))}
          style={barStyle(row.run)}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <TimelineBarTooltip row={row} />
      </Tooltip.Content>
    </Tooltip>
    {row.queue && (
      <span
        className={cn(BAR, 'opacity-40', barClass(row.status, isSelected))}
        style={barStyle(row.queue)}
      />
    )}
    {row.pending && (
      <span
        className={cn(BAR, 'border border-dashed border-warning')}
        style={barStyle(row.pending)}
      />
    )}
    <span
      className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-muted-foreground tabular-nums"
      style={labelStyle(row)}
    >
      {formatTimelineDuration(row.durationMs)}
    </span>
  </div>
);

const TimelineRow = ({
  row,
  isLast,
}: {
  row: TTimelineRow;
  isLast: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { isSelected, select, icon, childExecutionId, openChild } =
    useAutomationTimelineRow(row.action);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={select}
      onKeyDown={(event) => event.key === 'Enter' && select()}
      className={cn(
        ROW_GRID,
        'relative h-9 cursor-pointer hover:bg-accent/40',
        isSelected && 'bg-accent/60',
      )}
    >
      <div className="flex min-w-0 items-center gap-2 border-r pl-6 pr-2">
        <TimelineTreeBranch isLast={isLast} />
        <TimelineNodeIcon name={icon} />
        <span className="truncate text-sm">{row.label}</span>
        {(row.action.attempt ?? 1) > 1 && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            try {row.action.attempt}
          </span>
        )}
        {childExecutionId && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-7 shrink-0"
            aria-label={t('history-view-workflow-run')}
            onClick={(event) => {
              event.stopPropagation();
              openChild();
            }}
          >
            <IconArrowsSplit2 className="size-4" />
          </Button>
        )}
      </div>
      <TimelineTrack row={row} isSelected={isSelected} />
    </div>
  );
};

const TimelineBody = ({
  timeline,
  triggerIcon,
}: {
  timeline: TExecutionTimeline;
  triggerIcon?: string;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className={cn(ROW_GRID, 'h-9 border-b')}>
        <div className="flex items-center gap-2 border-r px-3 text-sm text-muted-foreground">
          {t('history-timeline-steps')}
          <span className="rounded bg-muted px-1.5 text-xs">
            {timeline.rows.length}
          </span>
        </div>
        <TimelineAxis timeline={timeline} />
      </div>
      <div className="relative py-1">
        <TimelineGuides timeline={timeline} />
        <div className={cn(ROW_GRID, 'relative h-9')}>
          <div className="relative flex items-center gap-2 border-r px-3 text-sm font-medium">
            <TimelineNodeIcon name={triggerIcon} />
            {t('history-timeline-whole-run')}
            <span className="absolute bottom-0 left-6 top-[calc(50%+0.75rem)] border-l" />
          </div>
          <div className="relative mx-4 h-full">
            <span
              className={cn(
                BAR,
                'bg-foreground/10',
                timeline.isRunning && 'animate-pulse',
              )}
              style={barStyle(timeline.run)}
            />
          </div>
        </div>
        {timeline.rows.map((row, index) => (
          <TimelineRow
            key={row.key}
            row={row}
            isLast={index === timeline.rows.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export const AutomationHistoryTimeline = () => {
  const { t } = useTranslation('automations');
  const { timeline, triggerIcon, loading, refetch } =
    useAutomationExecutionTimeline();

  if (!timeline) {
    return loading ? (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    ) : null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none items-center border-b">
        <TimelineStat
          label={t('history-timeline-duration')}
          value={formatTimelineDuration(timeline.totalMs)}
        />
        <TimelineStat
          label={t('history-timeline-steps')}
          value={String(timeline.rows.length)}
        />
        <TimelineStat
          label={t('history-timeline-errors')}
          value={String(timeline.errorCount)}
        />
        <TimelineStat
          label={t('history-timeline-retries')}
          value={String(timeline.retryCount)}
        />
        <Button
          variant="ghost"
          disabled={loading}
          className="ml-auto mr-2 shrink-0"
          onClick={() => refetch()}
        >
          {t('history-reload')} <IconRefresh />
        </Button>
      </div>
      {timeline.rows.length ? (
        <TimelineBody timeline={timeline} triggerIcon={triggerIcon} />
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t('no-results')}
        </p>
      )}
    </div>
  );
};

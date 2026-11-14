import {
  IconChartLine,
  IconReload,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import {
  Button,
  ChartContainer,
  ChartTooltipContent,
  cn,
  Label,
  Spinner,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  formatSegmentNumber,
  segmentTooltipLabel,
  useSegmentOverview,
} from '../hooks/useSegmentOverview';
import { SegmentRebuildButton } from './SegmentRebuildButton';
import { ISegment } from '../types';
import { SegmentBuildProgress } from './SegmentBuildProgress';

const LEVEL_CONFIG = { count: { label: 'Members', color: 'var(--primary)' } };
const MOVEMENT_CONFIG = {
  joined: { label: 'Joined', color: 'var(--success)' },
  left: { label: 'Left', color: 'var(--destructive)' },
};

const Stat = ({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 min-w-36 px-5 py-4 border-r last:border-r-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span
      className={cn(
        'flex items-center gap-1 text-2xl font-medium tabular-nums',
        tone === 'up' && 'text-success',
        tone === 'down' && 'text-destructive',
      )}
    >
      {icon}
      {value}
    </span>
  </div>
);

export const SegmentOverview = ({
  segment,
  days = 30,
  onRefresh,
  actions,
}: {
  segment?: ISegment;
  days?: number;
  onRefresh?: () => Promise<unknown> | void;
  // The host's own buttons for this segment, placed beside rebuild.
  actions?: ReactNode;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });
  const {
    loading,
    refreshing,
    handleRefresh,
    showRebuild,
    membersLabel,
    showMovement,
    joinedLabel,
    leftLabel,
    change,
    hasTrend,
    series,
    emptyMessage,
    levelLabel,
    movementLabel,
    tickFormatter,
  } = useSegmentOverview({ segment, days, onRefresh });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 space-y-4">
      <SegmentBuildProgress segment={segment} />

      <div className="flex flex-wrap items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-muted-foreground"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <IconReload className={cn('size-4', refreshing && 'animate-spin')} />
          {t('refresh')}
        </Button>
        {/* Re-reading the number and re-deriving it are different actions,
            so they are two buttons rather than one that guesses. */}
        {/* While a build runs, its own row carries the stop - repeating it
            here left two of them on screen with nothing to tell them
            apart. */}
        {showRebuild && <SegmentRebuildButton segment={segment} size="sm" />}
        {actions}
      </div>

      <div className="flex flex-wrap rounded-lg border">
        <Stat label={t('members')} value={membersLabel} />
        {/* Nothing has moved yet on a segment this young, and a coloured zero
            reads as a measurement rather than as the absence of one. */}
        {showMovement && (
          <>
            <Stat label={t('joined')} value={joinedLabel} tone="up" />
            <Stat label={t('left')} value={leftLabel} tone="down" />
          </>
        )}
        {change && (
          <Stat
            label={t('change')}
            value={change.value}
            tone={change.tone}
            icon={
              change.rising ? (
                <IconTrendingUp className="size-5" />
              ) : (
                <IconTrendingDown className="size-5" />
              )
            }
          />
        )}
      </div>

      {/* Two full charts drawn from a single day look broken rather than new,
          so a segment with nothing to plot yet says so in one line. */}
      {!hasTrend ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
          <IconChartLine className="size-6 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            {t(emptyMessage.key, emptyMessage.values)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="space-y-2 rounded-lg border p-4">
            <Label>{t(levelLabel.key, levelLabel.values)}</Label>
            <ChartContainer config={LEVEL_CONFIG} className="h-48 w-full">
              {/* A line, not an area, because the axis does not start at
                  zero. A filled area reads as the quantity underneath it, so
                  cutting its baseline overstates every wobble; a line claims
                  nothing but the path it traces. */}
              <LineChart data={series} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="at"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={tickFormatter}
                  className="text-xs"
                />
                {/* Scaled to the data, not to zero: a segment of a million
                    moving by ten is a flat line on any axis that starts at
                    zero, which is the one thing this chart exists to show. The
                    labels carry the real numbers, so the scale is readable
                    rather than implied. */}
                <YAxis
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  allowDecimals={false}
                  tickFormatter={formatSegmentNumber}
                  className="text-xs"
                />
                <Tooltip
                  content={
                    <ChartTooltipContent labelFormatter={segmentTooltipLabel} />
                  }
                />
                <Line
                  dataKey="count"
                  type="monotone"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ChartContainer>
          </section>

          <section className="space-y-2 rounded-lg border p-4">
            <Label>{t(movementLabel.key, movementLabel.values)}</Label>
            <ChartContainer config={MOVEMENT_CONFIG} className="h-40 w-full">
              <BarChart data={series} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="at"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={tickFormatter}
                  className="text-xs"
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Tooltip
                  content={
                    <ChartTooltipContent labelFormatter={segmentTooltipLabel} />
                  }
                />
                <Bar dataKey="joined" fill="var(--color-joined)" radius={2} />
                <Bar dataKey="left" fill="var(--color-left)" radius={2} />
              </BarChart>
            </ChartContainer>
          </section>
        </div>
      )}
    </div>
  );
};

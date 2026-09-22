import {
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
import { useState } from 'react';
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
import { useSegmentGrowth } from '../hooks/useSegmentGrowth';
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
  <div className="flex flex-col gap-0.5">
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

const tooltipLabel = (at: string) =>
  new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const tickLabel = (at: string, hourly: boolean) =>
  hourly
    ? new Date(at).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : at.slice(5, 10);

export const SegmentOverview = ({
  segment,
  days = 30,
  onRefresh,
}: {
  segment?: ISegment;
  days?: number;
  onRefresh?: () => Promise<unknown> | void;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });
  const {
    joined,
    left,
    growth,
    hasTrend,
    hourly,
    span,
    measuredSince,
    series,
    loading,
    refetch,
  } = useSegmentGrowth(segment?._id, days);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetch(), onRefresh?.()]);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  const rising = (growth ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6">
      <SegmentBuildProgress segment={segment} />

      <div className="flex flex-wrap items-start gap-10">
        <Stat
          label={t('members')}
          value={
            segment?.membersCount === undefined ||
            segment?.membersCount === null
              ? '—'
              : segment.membersCount.toLocaleString()
          }
        />
        {/* Nothing has moved yet on a segment this young, and a coloured zero
            reads as a measurement rather than as the absence of one. */}
        {!!(joined || left) && (
          <>
            <Stat
              label={t('joined')}
              value={`+${joined.toLocaleString()}`}
              tone="up"
            />
            <Stat
              label={t('left')}
              value={`−${left.toLocaleString()}`}
              tone="down"
            />
          </>
        )}
        {hasTrend && growth !== null && (
          <Stat
            label={t('change')}
            value={`${rising ? '+' : ''}${growth}%`}
            tone={rising ? 'up' : 'down'}
            icon={
              rising ? (
                <IconTrendingUp className="size-5" />
              ) : (
                <IconTrendingDown className="size-5" />
              )
            }
          />
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="text-muted-foreground"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <IconReload
              className={cn('size-4', refreshing && 'animate-spin')}
            />
            {t('refresh')}
          </Button>
          {/* Re-reading the number and re-deriving it are different actions,
              so they are two buttons rather than one that guesses. */}
          {/* While a build runs, its own row carries the stop - repeating it
              here left two of them on screen with nothing to tell them
              apart. */}
          {segment?.status !== 'building' && (
            <SegmentRebuildButton segment={segment} size="sm" />
          )}
        </div>
      </div>

      {/* Two full charts drawn from a single day look broken rather than new,
          so a segment with nothing to plot yet says so in one line. */}
      {!hasTrend ? (
        <p className="text-sm text-muted-foreground">
          {measuredSince
            ? t('measured-since', { date: measuredSince })
            : t('no-history')}
        </p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <Label>
              {hourly ? t('level-recent') : t('level', { days: span })}
            </Label>
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
                  tickFormatter={(at: string) => tickLabel(at, hourly)}
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
                  tickFormatter={(value: number) => value.toLocaleString()}
                  className="text-xs"
                />
                <Tooltip
                  content={
                    <ChartTooltipContent labelFormatter={tooltipLabel} />
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

          <section className="space-y-2">
            <Label>
              {hourly ? t('movement-recent') : t('movement', { days: span })}
            </Label>
            <ChartContainer config={MOVEMENT_CONFIG} className="h-40 w-full">
              <BarChart data={series} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="at"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={(at: string) => tickLabel(at, hourly)}
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
                    <ChartTooltipContent labelFormatter={tooltipLabel} />
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

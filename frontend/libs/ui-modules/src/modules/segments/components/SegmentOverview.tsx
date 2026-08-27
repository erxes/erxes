import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import {
  ChartContainer,
  ChartTooltipContent,
  cn,
  Label,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSegmentGrowth } from '../hooks/useSegmentGrowth';
import { ISegment } from '../types';
import { SegmentBuildProgress } from './SegmentBuildProgress';

/**
 * What a segment is, and how it got there.
 *
 * Two charts because they answer different questions and neither implies the
 * other: the level says how big the segment is, the movement says what made it
 * that size. A jump in the level with no movement under it is a rebuild rather
 * than churn - worth being able to tell apart at a glance.
 */

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

const shortDate = (date: string) => date.slice(5);

export const SegmentOverview = ({
  segment,
  days = 30,
}: {
  segment?: ISegment;
  days?: number;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });
  const { series, joined, left, growth, loading } = useSegmentGrowth(
    segment?._id,
    days,
  );

  if (loading) {
    return <Spinner />;
  }

  const rising = (growth ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6">
      <SegmentBuildProgress segment={segment} />

      <div className="flex flex-wrap gap-10">
        <Stat
          label={t('members')}
          value={
            // Never counted is not zero members; an em dash says so without
            // claiming the segment is empty.
            segment?.membersCount === undefined ||
            segment?.membersCount === null
              ? '—'
              : segment.membersCount.toLocaleString()
          }
        />
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
        {growth !== null && (
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
      </div>

      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('no-history')}</p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <Label>{t('level', { days })}</Label>
            <ChartContainer config={LEVEL_CONFIG} className="h-48 w-full">
              <AreaChart data={series} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={shortDate}
                  className="text-xs"
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  stroke="var(--color-count)"
                  fill="var(--color-count)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={false}
                  // A day the worker never settled has no point. Bridging the
                  // gap would draw a movement that was never measured.
                  connectNulls={false}
                />
              </AreaChart>
            </ChartContainer>
          </section>

          <section className="space-y-2">
            <Label>{t('movement', { days })}</Label>
            <ChartContainer config={MOVEMENT_CONFIG} className="h-40 w-full">
              <BarChart data={series} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={shortDate}
                  className="text-xs"
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Tooltip content={<ChartTooltipContent />} />
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

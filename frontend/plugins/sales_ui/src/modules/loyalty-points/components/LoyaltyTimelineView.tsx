import { IconAlertTriangle } from '@tabler/icons-react';
import {
  Button,
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  cn,
  Skeleton,
  ToggleGroup,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
// Chart parts come from this bundle's recharts: its chart's store is not the
// one erxes-ui's copy reads.
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLoyaltyDrill } from '../drill';
import { TPeriod, TTimelineInterval } from '../summary';

const INTERVALS: TTimelineInterval[] = ['day', 'week', 'month'];

const ChartPanel = ({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3',
      className,
    )}
  >
    <span className="text-xs font-medium text-muted-foreground">{title}</span>
    {children}
  </div>
);

export type TLoyaltyTimelineProps = {
  interval: TTimelineInterval;
  changeInterval: (interval: TTimelineInterval) => void;
  loading: boolean;
  error?: Error;
  refetch: () => unknown;
  periods: TPeriod[];
  isEmpty: boolean;
};

/** What a source moved per day, week or month, and its running net. */
export const LoyaltyTimelineView = ({
  interval,
  changeInterval,
  loading,
  error,
  refetch,
  periods,
  isEmpty,
}: TLoyaltyTimelineProps) => {
  const { t } = useTranslation('sales');
  const drill = useLoyaltyDrill();
  // A period's bar opens what moved in it.
  const openPeriod = (entry: { payload?: TPeriod }) =>
    entry.payload &&
    drill?.open({
      period: { interval, key: entry.payload.key },
      label: entry.payload.label,
    });

  const chartConfig = {
    earned: {
      label: t('loyalty-insight-earned', 'Earned'),
      color: 'var(--success)',
    },
    spent: {
      label: t('loyalty-insight-spent', 'Spent'),
      color: 'var(--primary)',
    },
    refunded: {
      label: t('loyalty-insight-refunded', 'Refunded'),
      color: 'var(--destructive)',
    },
    recalculated: {
      label: t('loyalty-insight-recalculated', 'Recalculated'),
      color: 'var(--warning)',
    },
    net: {
      label: t('loyalty-insight-net', 'Net'),
      color: 'var(--muted-foreground)',
    },
    cumulative: {
      label: t('loyalty-timeline-cumulative-label', 'Running net'),
      color: 'var(--primary)',
    },
  } satisfies ChartConfig;

  const intervalLabels: Record<TTimelineInterval, string> = {
    day: t('loyalty-timeline-day', 'Day'),
    week: t('loyalty-timeline-week', 'Week'),
    month: t('loyalty-timeline-month', 'Month'),
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-destructive">
        <IconAlertTriangle className="size-4" />
        {t('loyalty-timeline-error', 'Could not load the points over time')}
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t('retry', 'Try again')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        className="w-fit"
        value={interval}
        onValueChange={(value) =>
          value && changeInterval(value as TTimelineInterval)
        }
      >
        {INTERVALS.map((value) => (
          <ToggleGroup.Item key={value} value={value} className="px-3">
            {intervalLabels[value]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : isEmpty ? (
        <div className="rounded-lg border bg-background px-3 py-8 text-center text-sm text-muted-foreground">
          {t(
            'loyalty-timeline-empty',
            'No points moved in this period. Try a longer one.',
          )}
        </div>
      ) : (
        // The flow is the point; the running net only shows its direction.
        <div className="grid gap-3 lg:grid-cols-3">
          <ChartPanel
            className="lg:col-span-2"
            title={t('loyalty-timeline-flow', 'Points moved per period')}
          >
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ComposedChart
                data={periods}
                stackOffset="sign"
                margin={{ top: 8 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend
                  content={({ payload }) => (
                    <ChartLegendContent payload={payload} />
                  )}
                />
                <Bar
                  dataKey="earned"
                  stackId="kinds"
                  className="cursor-pointer"
                  onClick={openPeriod}
                  fill="var(--color-earned)"
                />
                <Bar
                  dataKey="spent"
                  stackId="kinds"
                  className="cursor-pointer"
                  onClick={openPeriod}
                  fill="var(--color-spent)"
                />
                <Bar
                  dataKey="refunded"
                  stackId="kinds"
                  className="cursor-pointer"
                  onClick={openPeriod}
                  fill="var(--color-refunded)"
                />
                <Bar
                  dataKey="recalculated"
                  stackId="kinds"
                  className="cursor-pointer"
                  onClick={openPeriod}
                  fill="var(--color-recalculated)"
                />
                <Line
                  dataKey="net"
                  type="monotone"
                  stroke="var(--color-net)"
                  strokeDasharray="4 3"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ChartContainer>
          </ChartPanel>
          <ChartPanel
            title={t(
              'loyalty-timeline-cumulative',
              'Running net of these records (not a wallet balance)',
            )}
          >
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={periods} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="cumulative"
                  type="monotone"
                  stroke="var(--color-cumulative)"
                  fill="var(--color-cumulative)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </ChartPanel>
        </div>
      )}
    </div>
  );
};

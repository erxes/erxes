import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  cn,
  ToggleGroup,
} from 'erxes-ui';
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

export const LOYALTY_TIMELINE_INTERVALS: TTimelineInterval[] = [
  'day',
  'week',
  'month',
];

export const useLoyaltyIntervalLabels = (): Record<
  TTimelineInterval,
  string
> => {
  const { t } = useTranslation('sales');

  return {
    day: t('loyalty-timeline-day', 'Day'),
    week: t('loyalty-timeline-week', 'Week'),
    month: t('loyalty-timeline-month', 'Month'),
  };
};

const useLoyaltyChartConfig = () => {
  const { t } = useTranslation('sales');

  return {
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
};

export const LoyaltyIntervalToggle = ({
  interval,
  changeInterval,
}: {
  interval: TTimelineInterval;
  changeInterval: (interval: TTimelineInterval) => void;
}) => {
  const labels = useLoyaltyIntervalLabels();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      className="w-fit"
      value={interval}
      onValueChange={(value) =>
        value && changeInterval(value as TTimelineInterval)
      }
    >
      {LOYALTY_TIMELINE_INTERVALS.map((value) => (
        <ToggleGroup.Item key={value} value={value} className="px-3">
          {labels[value]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

type TLoyaltyChartProps = {
  periods: TPeriod[];
  className?: string;
};

/** Earned up, spent and refunded down, net as a line; a bar drills. */
export const LoyaltyFlowChart = ({
  periods,
  interval,
  className,
}: TLoyaltyChartProps & { interval: TTimelineInterval }) => {
  const chartConfig = useLoyaltyChartConfig();
  const drill = useLoyaltyDrill();
  // A period's bar opens what moved in it.
  const openPeriod = drill
    ? (entry: { payload?: TPeriod }) =>
        entry.payload &&
        drill.open({
          period: { interval, key: entry.payload.key },
          label: entry.payload.label,
        })
    : undefined;
  const barClassName = cn(drill && 'cursor-pointer');

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
      <ComposedChart data={periods} stackOffset="sign" margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={72} />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend
          content={({ payload }) => <ChartLegendContent payload={payload} />}
        />
        <Bar
          dataKey="earned"
          stackId="kinds"
          className={barClassName}
          onClick={openPeriod}
          fill="var(--color-earned)"
        />
        <Bar
          dataKey="spent"
          stackId="kinds"
          className={barClassName}
          onClick={openPeriod}
          fill="var(--color-spent)"
        />
        <Bar
          dataKey="refunded"
          stackId="kinds"
          className={barClassName}
          onClick={openPeriod}
          fill="var(--color-refunded)"
        />
        <Bar
          dataKey="recalculated"
          stackId="kinds"
          className={barClassName}
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
  );
};

/** The records' running net; not a wallet balance. */
export const LoyaltyRunningNetChart = ({
  periods,
  className,
}: TLoyaltyChartProps) => {
  const chartConfig = useLoyaltyChartConfig();

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
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
  );
};

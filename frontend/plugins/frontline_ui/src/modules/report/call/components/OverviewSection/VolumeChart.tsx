import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { VolumePoint } from '../../types';

interface VolumeChartProps {
  data: VolumePoint[];
}

const CHART_CONFIG = {
  incoming: { label: 'Inbound', color: 'var(--chart-2)' },
  outgoing: { label: 'Outbound', color: 'var(--chart-3)' },
  answered: { label: 'Answered', color: 'var(--pos)' },
} as const;

/** Daily call-volume area chart with inbound / outbound / answered series. */
export const VolumeChart = memo(function VolumeChart({
  data,
}: VolumeChartProps) {
  const { t } = useTranslation('frontline');
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        day: format(new Date(d.day), 'MMM dd'),
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {t('no-volume-data')}
      </div>
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="cr-vol-incoming" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cr-vol-outgoing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={32}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        <Area
          type="monotone"
          dataKey="incoming"
          name={t('inbound')}
          stroke="var(--chart-2)"
          fill="url(#cr-vol-incoming)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="outgoing"
          name={t('outbound')}
          stroke="var(--chart-3)"
          fill="url(#cr-vol-outgoing)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="answered"
          name="Answered"
          stroke="var(--pos)"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
});

import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
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
  noAnswer: { label: 'No answer', color: 'var(--destructive)' },
} as const;

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
        {t('no-volume-data', 'No volume data for selected range')}
      </div>
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        barGap={2}
      >
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
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        <Bar
          dataKey="incoming"
          name={t('inbound', 'Inbound')}
          fill="var(--chart-1)"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
        />
        <Bar
          dataKey="outgoing"
          name={t('outbound', 'Outbound')}
          fill="var(--chart-5)"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
        />
        <Bar
          dataKey="answered"
          name="Answered"
          fill="var(--success)"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
        />
        <Bar
          dataKey="noAnswer"
          name={t('no-answer', 'No answer')}
          fill="var(--destructive)"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ChartContainer>
  );
});

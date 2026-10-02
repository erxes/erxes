import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { SlaPoint } from '../../types';
import { rateColorVar } from '../Meter';

interface SlaTrendChartProps {
  data: SlaPoint[];
}

const CHART_CONFIG = {
  serviceLevel: { label: 'Service level', color: 'var(--chart-2)' },
} as const;

export const SlaTrendChart = memo(function SlaTrendChart({
  data,
}: SlaTrendChartProps) {
  const { t } = useTranslation('frontline');

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        day: format(new Date(point.day), 'MMM dd'),
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {t('sla-no-trend-data', 'No inbound calls in the selected range')}
      </div>
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => `${value}%`}
          width={40}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="serviceLevel"
          name={t('kpi-service-level', 'Service Level')}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        >
          {chartData.map((point) => (
            <Cell key={point.day} fill={rateColorVar(point.serviceLevel)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
});

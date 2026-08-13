import { memo, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  type LegendPayload,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AreaGradient } from '@/report/components/chart/AreaGradient';
import { CustomLegendContent } from '@/report/components/chart/legend';
import type { TagStat } from '../../types';

export interface TagChartProps {
  tags: TagStat[];
}

/** The palette the card-system charts use, so both report areas read alike. */
const PIE_COLORS = [
  'var(--chart-50)',
  'var(--chart-100)',
  'var(--chart-200)',
  'var(--chart-300)',
  'var(--chart-400)',
  'var(--chart-500)',
  'var(--chart-600)',
  'var(--chart-700)',
  'var(--chart-800)',
  'var(--chart-900)',
  'var(--chart-950)',
];

const useChartConfig = () => {
  const { t } = useTranslation('frontline');

  return useMemo(
    () => ({
      totalCalls: { label: t('total'), color: 'var(--primary)' },
      answeredRate: {
        label: t('answered-rate', 'Answered rate'),
        color: 'var(--success)',
      },
    }),
    [t],
  );
};

const useChartData = (tags: TagStat[]) => {
  const { t } = useTranslation('frontline');

  return useMemo(
    () =>
      tags.map((tag) => ({
        tag: tag.name ?? t('deleted-tag', 'Deleted tag'),
        totalCalls: tag.totalCalls,
        answeredRate: tag.answeredRate,
      })),
    [tags, t],
  );
};

/**
 * Call volume and answered rate share one axis only after the rate is scaled
 * to the volume range, so a 0-100 rate stays visible next to call counts that
 * run into the hundreds. Tooltips report the unscaled rate.
 */
const useScaledData = (tags: TagStat[]) => {
  const data = useChartData(tags);

  return useMemo(() => {
    const maxCalls = Math.max(...data.map(({ totalCalls }) => totalCalls), 0);
    const scale = maxCalls > 0 ? maxCalls / 100 : 1;

    return data.map((row) => ({
      ...row,
      answeredRateScaled: row.answeredRate * scale,
    }));
  }, [data]);
};

export const TagBarChart = memo(function TagBarChart({ tags }: TagChartProps) {
  const config = useChartConfig();
  const data = useScaledData(tags);

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Bar
          dataKey="totalCalls"
          fill="var(--primary)"
          name={config.totalCalls.label}
        />
        <Bar
          dataKey="answeredRateScaled"
          fill="var(--success)"
          name={config.answeredRate.label}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip
          content={<ChartTooltipContent />}
          formatter={(value: number, name: string, props: any) =>
            name === config.answeredRate.label
              ? [`${props.payload.answeredRate}%`, name]
              : [value, name]
          }
        />
      </BarChart>
    </ChartContainer>
  );
});

export const TagLineChart = memo(function TagLineChart({
  tags,
}: TagChartProps) {
  const config = useChartConfig();
  const data = useChartData(tags);

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <AreaChart data={data} margin={{ top: 10 }}>
        <defs>
          <AreaGradient id="call-tag-primary" color="var(--primary)" />
          <AreaGradient id="call-tag-success" color="var(--success)" />
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
        <YAxis yAxisId="calls" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="rate"
          orientation="right"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <Area
          yAxisId="calls"
          dataKey="totalCalls"
          name={config.totalCalls.label}
          type="monotone"
          stroke="var(--primary)"
          fill="url(#call-tag-primary)"
          fillOpacity={0.3}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          yAxisId="rate"
          dataKey="answeredRate"
          name={config.answeredRate.label}
          type="monotone"
          stroke="var(--success)"
          fill="url(#call-tag-success)"
          fillOpacity={0.3}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

export const TagPieChart = memo(function TagPieChart({ tags }: TagChartProps) {
  const [hovered, setHovered] = useState<string | undefined>();
  const config = useChartConfig();
  const rows = useChartData(tags);

  const data = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [rows],
  );

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <PieChart>
        <Pie
          dataKey="totalCalls"
          nameKey="tag"
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
        >
          {data.map((row) => (
            <Cell
              key={row.tag}
              fill={row.fill}
              opacity={hovered && hovered !== row.tag ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(payload: LegendPayload) =>
                setHovered(payload.value as string)
              }
              onMouseLeave={() => setHovered(undefined)}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

export const TagRadarChart = memo(function TagRadarChart({
  tags,
}: TagChartProps) {
  const config = useChartConfig();
  const data = useScaledData(tags);

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="tag" tickLine={false} tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} tick={false} axisLine={false} />
        <Radar
          name={config.totalCalls.label}
          dataKey="totalCalls"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
        />
        <Radar
          name={config.answeredRate.label}
          dataKey="answeredRateScaled"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.3}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip
          content={<ChartTooltipContent />}
          formatter={(value: number, name: string, props: any) =>
            name === config.answeredRate.label
              ? [`${props.payload.answeredRate}%`, name]
              : [value, name]
          }
        />
      </RadarChart>
    </ChartContainer>
  );
});

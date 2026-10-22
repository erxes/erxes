import {
  ChartContainer,
  ChartTooltipContent,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ResponsesChartType } from '@/report/types';
import { useMemo, memo, useState } from 'react';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Legend,
  LabelList,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  type LegendPayload,
} from 'recharts';
import { ColumnDef } from '@tanstack/table-core';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { CustomLegendContent } from './legend';
import { AreaGradient } from './AreaGradient';

// Charts for reports whose rows are a date and a count, rendered by chart type.
interface ChartProps {
  chartData: Array<{ date: string; count: number }>;
}

interface LineChartProps extends ChartProps {
  gradientId: string;
}

const DateCountBarChart = memo(function DateCountBarChart({
  chartData,
}: ChartProps) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart
        data={chartData}
        margin={{ top: 24, right: 10, left: 10, bottom: 60 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Bar dataKey="count" fill="var(--primary)" name={t('count')}>
          <LabelList
            dataKey="count"
            position="top"
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
          label={{ angle: -45, position: 'insideBottom' }}
        />
        <YAxis
          dataKey="count"
          tickLine={false}
          axisLine={false}
          label={{ value: t('count'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={(props) => <CustomLegendContent {...props} />} />
      </BarChart>
    </ChartContainer>
  );
});

const DateCountLineChart = memo(function DateCountLineChart({
  chartData,
  gradientId,
}: LineChartProps) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
      >
        <defs>
          <AreaGradient id={gradientId} color="var(--primary)" />
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          fill={`url(#${gradientId})`}
          strokeWidth={2}
          name={t('count')}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          dataKey="count"
          tickLine={false}
          axisLine={false}
          label={{ value: t('count'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={(props) => <CustomLegendContent {...props} />} />
      </AreaChart>
    </ChartContainer>
  );
});

const DateCountPieChart = memo(function DateCountPieChart({
  chartData,
}: ChartProps) {
  const [hoveredDate, setHoveredDate] = useState<string | undefined>(undefined);
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );
  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    const colors = [
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

    return chartData.map((item, index) => ({
      count: item.count || 0,
      date: item.date || undefined,
      fill: colors[index % colors.length],
    }));
  }, [chartData]);

  const handleMouseEnter = (date: string) => {
    setHoveredDate(date);
  };
  const handleMouseLeave = () => {
    setHoveredDate(undefined);
  };

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={data}>
        <Pie
          dataKey={'count'}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="date"
        >
          {data?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              opacity={hoveredDate && hoveredDate !== entry.date ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(data: LegendPayload) => {
                const date = data.value as string;
                if (date) {
                  handleMouseEnter(date);
                }
              }}
              onMouseLeave={handleMouseLeave}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

const DateCountRadarChart = memo(function DateCountRadarChart({
  chartData,
}: ChartProps) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );

  const maxCount = useMemo(() => {
    if (!chartData || chartData.length === 0) return 100;
    const max = Math.max(...chartData.map((item) => item.count || 0), 0);
    return Math.ceil(max / 10) * 10 || 100;
  }, [chartData]);

  const data = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    return chartData.map((item) => ({
      date: item.date || 'Unknown',
      count: item.count || 0,
    }));
  }, [chartData]);

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="date"
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxCount]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name={t('count')}
          dataKey="count"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
        />
        <Legend content={(props) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </RadarChart>
    </ChartContainer>
  );
});

interface DateCountTableData {
  date: string;
  count: number;
}

const DateCountTableChart = memo(function DateCountTableChart({
  chartData,
}: ChartProps) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  const tableData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    return chartData.map((item) => ({
      date: item.date || 'Unknown',
      count: item.count || 0,
    }));
  }, [chartData]);

  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        columns={dateCountTableColumns(t)}
        data={tableData}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
});

const dateCountTableColumns = (
  t: TFunction,
): ColumnDef<DateCountTableData>[] => [
  {
    id: 'date',
    header: t('date'),
    accessorKey: 'date',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-4 text-xs">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'count',
    header: t('count'),
    accessorKey: 'count',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
];

export const DATE_COUNT_EXPORT_COLUMNS = [
  { key: 'date' as const, header: 'Date' },
  { key: 'count' as const, header: 'Count' },
];

export const DateCountChart = ({
  chartType,
  chartData,
  gradientId,
}: Readonly<LineChartProps & { chartType: ResponsesChartType }>) => {
  switch (chartType) {
    case ResponsesChartType.Line:
      return (
        <DateCountLineChart chartData={chartData} gradientId={gradientId} />
      );
    case ResponsesChartType.Pie:
      return <DateCountPieChart chartData={chartData} />;
    case ResponsesChartType.Radar:
      return <DateCountRadarChart chartData={chartData} />;
    case ResponsesChartType.Table:
      return <DateCountTableChart chartData={chartData} />;
    default:
      return <DateCountBarChart chartData={chartData} />;
  }
};

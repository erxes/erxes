import { ChartContainer, Skeleton } from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { useConversationResolvedByDate } from '../hooks/useConversationResolvedByDate';
import { DateSelector } from './date-selector/DateSelector';
import { SelectChartType } from './select-chart-type/SelectChartType';
import { ResponsesChartType } from '../types';
import { useState, useMemo, memo } from 'react';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getFilters } from '../utils/dateFilters';

interface FrontlineReportByResolvedProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

interface ChartProps {
  chartData: Array<{ date: string; count: number }>;
}

export const ResolvedBarChart = memo(function ResolvedBarChart({
  chartData,
}: ChartProps) {
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
        margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Bar dataKey="count" fill="var(--primary)" name="Count" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
          label={{ value: 'Date', angle: -45, position: 'insideBottom' }}
        />
        <YAxis dataKey="count" tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
      </BarChart>
    </ChartContainer>
  );
});

export const ResolvedLineChart = memo(function ResolvedLineChart({
  chartData,
}: ChartProps) {
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
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
          strokeWidth={2}
          name="Count"
          dot={{ fill: 'var(--primary)' }}
          activeDot={{ r: 6 }}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
          label={{ value: 'Date', angle: -45, position: 'insideBottom' }}
        />
        <YAxis dataKey="count" tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
      </AreaChart>
    </ChartContainer>
  );
});

export const FrontlineReportByResolved = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportByResolvedProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [dateValue, setDateValue] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [chartType, setChartType] = useState<ResponsesChartType>(
    ResponsesChartType.Bar,
  );
  const [filters, setFilters] = useState(() => getFilters());

  const { reports, loading } = useConversationResolvedByDate({
    variables: {
      filters: {
        ...filters,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleDateValueChange = (value: string) => {
    setDateValue(value);
    const newFilters = getFilters(value || undefined);
    setFilters(newFilters);
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
  };

  const chartData = useMemo(() => {
    return reports?.reportConversationResolvedDate || [];
  }, [reports]);

  if (loading) return <Skeleton className="w-full h-48" />;

  const hasData = chartData && chartData.length > 0;

  const renderChart = () => {
    if (!hasData) {
      return <FrontlineCard.Empty />;
    }

    switch (chartType) {
      case ResponsesChartType.Bar:
        return <ResolvedBarChart chartData={chartData} />;
      case ResponsesChartType.Line:
        return <ResolvedLineChart chartData={chartData} />;
      default:
        return <ResolvedBarChart chartData={chartData} />;
    }
  };

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations resolved in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <>
            <GroupSelect
              value={sourceFilter}
              onValueChange={handleSourceFilterChange}
            />
            <DateSelector
              value={dateValue}
              onValueChange={handleDateValueChange}
            />
            <SelectChartType
              value={chartType}
              onValueChange={setChartType}
              hideCircularCharts
            />
          </>
        }
      />
      <FrontlineCard.Content>{renderChart()}</FrontlineCard.Content>
    </FrontlineCard>
  );
};

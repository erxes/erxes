import {
  ChartContainer,
  ChartTooltipContent,
  RecordTable,
  RecordTableInlineCell,
  cn,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useConversationReportsByStatus } from '../../hooks/useConversationReportsByStatus';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType } from '@/report/types';
import { useState, useMemo, memo, useEffect } from 'react';
import { useAtom } from 'jotai';
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
import { getFilters } from '@/report/utils/dateFilters';
import { CustomLegendContent } from '../chart/legend';
import {
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportSourceFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
} from '@/report/states';
import { ReportFilter } from '../filter-popover/report-filter';

interface ConversationOpenProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

interface ChartProps {
  chartData: Array<{ date: string; count: number }>;
}

export const OpenBarChart = memo(function OpenBarChart({
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
          label={{ angle: -45, position: 'insideBottom' }}
        />
        <YAxis
          dataKey="count"
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
      </BarChart>
    </ChartContainer>
  );
});

export const OpenLineChart = memo(function OpenLineChart({
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
          label={{ angle: -45, position: 'insideBottom' }}
        />
        <YAxis
          dataKey="count"
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
      </AreaChart>
    </ChartContainer>
  );
});

export const OpenPieChart = memo(function OpenPieChart({
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
          content={(props: any) => (
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

export const OpenRadarChart = memo(function OpenRadarChart({
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
          name="Count"
          dataKey="count"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </RadarChart>
    </ChartContainer>
  );
});

interface OpenTableData {
  date: string;
  count: number;
}

export const OpenTableChart = memo(function OpenTableChart({
  chartData,
}: ChartProps) {
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
        columns={openTableColumns}
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

export const openTableColumns: ColumnDef<OpenTableData>[] = [
  {
    id: 'date',
    header: 'Date',
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
    header: 'Count',
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

export const ConversationOpen = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: ConversationOpenProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(id));
  const [sourceFilter, setSourceFilter] = useAtom(
    getReportSourceFilterAtom(id),
  );
  const [channelFilter, setChannelFilter] = useAtom(
    getReportChannelFilterAtom(id),
  );
  const [memberFilter, setMemberFilter] = useAtom(
    getReportMemberFilterAtom(id),
  );
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    const newFilters = getFilters(dateValue || undefined);
    setFilters(newFilters);
  }, [dateValue]);

  const { reports, loading } = useConversationReportsByStatus({
    variables: {
      filters: {
        ...filters,
        channelIds: channelFilter.length ? channelFilter : undefined,
        memberIds: memberFilter.length ? memberFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
    notifyOnNetworkStatusChange: true,
  });


  const chartData = useMemo(() => {
    return reports?.reportConversationOpenDate || [];
  }, [reports]);

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Total conversations open in the last 30 days"
      >
        <FrontlineCard.Header
          filter={
            <>
              <ReportFilter cardId={id} />
              <SelectChartType value={chartType} onValueChange={setChartType} />
            </>
          }
        />
        <FrontlineCard.Skeleton />
      </FrontlineCard>
    );
  }

  const hasData = chartData && chartData.length > 0;

  const renderChart = () => {
    if (!hasData) {
      return <FrontlineCard.Empty />;
    }

    switch (chartType) {
      case ResponsesChartType.Bar:
        return <OpenBarChart chartData={chartData} />;
      case ResponsesChartType.Line:
        return <OpenLineChart chartData={chartData} />;
      case ResponsesChartType.Pie:
        return <OpenPieChart chartData={chartData} />;
      case ResponsesChartType.Radar:
        return <OpenRadarChart chartData={chartData} />;
      case ResponsesChartType.Table:
        return <OpenTableChart chartData={chartData} />;
      default:
        return <OpenBarChart chartData={chartData} />;
    }
  };

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations open in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <>
            <ReportFilter cardId={id} />
            <SelectChartType value={chartType} onValueChange={setChartType} />
          </>
        }
      />
      <FrontlineCard.Content>
        <div
          className={cn(
            {
              'p-4': chartType !== ResponsesChartType.Table,
            },
            'size-full flex-1 flex-col flex',
          )}
        >
          {renderChart()}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

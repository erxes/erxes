import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketDate } from '@/report/hooks/useTicketOpenDate';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType } from '@/report/types';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';
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
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
  getReportPipelineFilterAtom,
  getReportStateFilterAtom,
  getReportPriorityFilterAtom,
  getReportFrequencyFilterAtom,
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { useChartPagination, ChartPagination } from '../chart-pagination/ChartPagination';
import { ChartExportButton } from '../chart-export/ChartExportButton';

interface TicketOpenDateProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

interface ChartProps {
  chartData: Array<{ date: string; count: number }>;
}

export const TicketOpenDate = ({ title, colSpan = 6, onColSpanChange }: TicketOpenDateProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));
  const [dateValue] = useAtom(getReportDateFilterAtom(id));
  const [channelFilter] = useAtom(getReportChannelFilterAtom(id));
  const [memberFilter] = useAtom(getReportMemberFilterAtom(id));
  const [pipelineFilter] = useAtom(getReportPipelineFilterAtom(id));
  const [stateFilter] = useAtom(getReportStateFilterAtom(id));
  const [priorityFilter] = useAtom(getReportPriorityFilterAtom(id));
  const [frequency] = useAtom(getReportFrequencyFilterAtom(id));
  const [tagFilter] = useAtom(getReportTicketTagFilterAtom(id));
  const [customerFilter] = useAtom(getReportCustomerFilterAtom(id));
  const [companyFilter] = useAtom(getReportCompanyFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
  }, [dateValue]);

  const { ticketDate, loading, error } = useTicketDate({
    variables: {
      filters: {
        ...filters,
        channelIds: channelFilter.length ? channelFilter : undefined,
        memberIds: memberFilter.length ? memberFilter : undefined,
        pipelineIds: pipelineFilter.length ? pipelineFilter : undefined,
        state: stateFilter || undefined,
        priority: priorityFilter.length ? priorityFilter : undefined,
        tagIds: tagFilter.length ? tagFilter : undefined,
        customerIds: customerFilter.length ? customerFilter : undefined,
        companyIds: companyFilter.length ? companyFilter : undefined,
        frequency,
      },
    },
  });

  const allData = useMemo(() => ticketDate || [], [ticketDate]);
  const {
    pagedData: chartData,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
    hasMultiplePages,
  } = useChartPagination(allData);

  const exportColumns = useMemo(() => [
    { key: 'date' as const, header: 'Date' },
    { key: 'count' as const, header: 'Count' },
  ], []);

  const filterEl = (
    <>
      <TicketReportFilter cardId={id} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
      <ChartExportButton data={allData} columns={exportColumns} filename="ticket-date" />
    </>
  );

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets opened over time"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Skeleton />
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets opened over time"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  const renderChart = () => {
    if (!chartData.length) return <FrontlineCard.Empty />;
    switch (chartType) {
      case ResponsesChartType.Line:
        return <TicketOpenLineChart chartData={chartData} />;
      case ResponsesChartType.Pie:
        return <TicketOpenPieChart chartData={chartData} />;
      case ResponsesChartType.Radar:
        return <TicketOpenRadarChart chartData={chartData} />;
      case ResponsesChartType.Table:
        return <TicketOpenTableChart chartData={chartData} />;
      default:
        return <TicketOpenBarChart chartData={chartData} />;
    }
  };

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Tickets opened over time"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={cn(
            { 'p-4': chartType !== ResponsesChartType.Table },
            'size-full flex-1 flex-col flex',
          )}
        >
          {renderChart()}
        </div>
        <ChartPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

export const TicketOpenBarChart = memo(function TicketOpenBarChart({ chartData }: ChartProps) {
  const chartConfig = useMemo(() => ({ count: { label: 'Count', color: 'var(--primary)' } }), []);
  if (!chartData.length) return null;
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Bar dataKey="count" fill="var(--primary)" name="Count" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
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

export const TicketOpenLineChart = memo(function TicketOpenLineChart({ chartData }: ChartProps) {
  const chartConfig = useMemo(() => ({ count: { label: 'Count', color: 'var(--primary)' } }), []);
  if (!chartData.length) return null;
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
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
        />
        <YAxis
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

export const TicketOpenPieChart = memo(function TicketOpenPieChart({ chartData }: ChartProps) {
  const [hoveredDate, setHoveredDate] = useState<string | undefined>(undefined);
  const chartConfig = useMemo(() => ({ count: { label: 'Count', color: 'var(--primary)' } }), []);
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
  const data = useMemo(
    () => chartData.map((item, i) => ({ ...item, fill: colors[i % colors.length] })),
    [chartData],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart>
        <Pie
          dataKey="count"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="date"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.fill}
              opacity={hoveredDate && hoveredDate !== entry.date ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(d: LegendPayload) => setHoveredDate(d.value as string)}
              onMouseLeave={() => setHoveredDate(undefined)}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

export const TicketOpenRadarChart = memo(function TicketOpenRadarChart({ chartData }: ChartProps) {
  const chartConfig = useMemo(() => ({ count: { label: 'Count', color: 'var(--primary)' } }), []);
  const maxCount = useMemo(
    () => Math.ceil(Math.max(...chartData.map((d) => d.count), 0) / 10) * 10 || 100,
    [chartData],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="date" tickLine={false} tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, maxCount]} tick={false} axisLine={false} />
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

export const TicketOpenTableChart = memo(function TicketOpenTableChart({ chartData }: ChartProps) {
  const columns: ColumnDef<{ date: string; count: number }>[] = [
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'count',
      header: 'Count',
      accessorKey: 'count',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
    },
  ];
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider data={chartData} columns={columns} className="m-3">
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

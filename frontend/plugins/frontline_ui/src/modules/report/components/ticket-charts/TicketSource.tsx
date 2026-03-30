import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketSource } from '@/report/hooks/useTicketSource';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType, SourceData } from '@/report/types';
import { memo, useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
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
import { ColumnDef } from '@tanstack/table-core';
import { type LegendPayload } from 'recharts';
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
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';

interface TicketSourceProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketSource = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: TicketSourceProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));
  const [dateValue] = useAtom(getReportDateFilterAtom(id));
  const [channelFilter] = useAtom(getReportChannelFilterAtom(id));
  const [memberFilter] = useAtom(getReportMemberFilterAtom(id));
  const [pipelineFilter] = useAtom(getReportPipelineFilterAtom(id));
  const [stateFilter] = useAtom(getReportStateFilterAtom(id));
  const [priorityFilter] = useAtom(getReportPriorityFilterAtom(id));
  const [tagFilter] = useAtom(getReportTicketTagFilterAtom(id));
  const [customerFilter] = useAtom(getReportCustomerFilterAtom(id));
  const [companyFilter] = useAtom(getReportCompanyFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
  }, [dateValue]);

  const { ticketSources, loading, error } = useTicketSource({
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
      },
    },
  });

  const allSources = useMemo(() => ticketSources || [], [ticketSources]);
  const {
    pagedData: sources,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allSources);

  const exportColumns = useMemo(
    () => [
      { key: 'name' as const, header: 'Source' },
      { key: 'count' as const, header: 'Count' },
      {
        key: 'percentage' as const,
        header: 'Percentage',
        format: (v: number) => `${v}%`,
      },
    ],
    [],
  );

  const filterEl = (
    <>
      <TicketReportFilter cardId={id} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
      <ChartExportButton
        data={allSources}
        columns={exportColumns}
        filename="ticket-source"
      />
    </>
  );

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets by source"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Skeleton />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets by source"
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

  if (!allSources.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No ticket sources found."
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={<TicketReportFilter cardId={id} />} />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Tickets by source"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={cn(
            { 'p-4': chartType !== ResponsesChartType.Table },
            'w-full',
          )}
        >
          {chartType === ResponsesChartType.Bar && (
            <TicketSourceBarChart sources={sources} />
          )}
          {chartType === ResponsesChartType.Line && (
            <TicketSourceLineChart sources={sources} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <TicketSourcePieChart sources={sources} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <TicketSourceRadarChart sources={sources} />
          )}
          {chartType === ResponsesChartType.Table && (
            <TicketSourceTableChart sources={sources} />
          )}
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

const CHART_COLORS = [
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

export const TicketSourceBarChart = memo(function TicketSourceBarChart({
  sources,
}: {
  sources: SourceData[];
}) {
  const chartConfig = useMemo(
    () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
    [],
  );
  const chartData = useMemo(
    () =>
      sources.map((s) => ({
        source: s.name || s._id || 'Unknown',
        count: s.count || 0,
      })),
    [sources],
  );
  if (!chartData.length) return null;
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="source" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Bar dataKey="count" fill="var(--primary)" name="Count" />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

export const TicketSourceLineChart = memo(function TicketSourceLineChart({
  sources,
}: {
  sources: SourceData[];
}) {
  const chartConfig = useMemo(
    () => ({
      count: { label: 'Count', color: 'var(--primary)' },
      percentage: { label: 'Percentage', color: 'var(--success)' },
    }),
    [],
  );
  const chartData = useMemo(
    () =>
      sources.map((s) => ({
        source: s.name || s._id || 'Unknown',
        count: s.count || 0,
        percentage: s.percentage || 0,
      })),
    [sources],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="source" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="count"
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="percentage"
          orientation="right"
          tickLine={false}
          axisLine={false}
          label={{
            value: 'Percentage (%)',
            angle: 90,
            position: 'insideRight',
          }}
        />
        <Area
          yAxisId="count"
          dataKey="count"
          type="monotone"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Area
          yAxisId="percentage"
          dataKey="percentage"
          type="monotone"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.3}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

export const TicketSourcePieChart = memo(function TicketSourcePieChart({
  sources,
}: {
  sources: SourceData[];
}) {
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const chartConfig = useMemo(
    () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
    [],
  );
  const chartData = useMemo(
    () =>
      sources.map((s, i) => ({
        source: s.name || s._id || 'Unknown',
        count: s.count || 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [sources],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="source"
        >
          {chartData.map((item, i) => (
            <Cell
              key={i}
              fill={item.fill}
              opacity={hovered && hovered !== item.source ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(d: LegendPayload) => setHovered(d.value as string)}
              onMouseLeave={() => setHovered(undefined)}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

export const TicketSourceRadarChart = memo(function TicketSourceRadarChart({
  sources,
}: {
  sources: SourceData[];
}) {
  const chartConfig = useMemo(
    () => ({
      count: { label: 'Count', color: 'var(--primary)' },
      percentage: { label: 'Percentage', color: 'var(--success)' },
    }),
    [],
  );
  const maxCount = useMemo(
    () =>
      Math.ceil(Math.max(...sources.map((s) => s.count || 0), 0) / 10) * 10 ||
      100,
    [sources],
  );
  const maxPercentage = useMemo(
    () => Math.max(...sources.map((s) => s.percentage || 0), 100),
    [sources],
  );
  const scaleFactor =
    maxCount > 0 && maxPercentage > 0 ? maxCount / maxPercentage : 1;
  const chartData = useMemo(
    () =>
      sources.map((s) => ({
        source: s.name || s._id || 'Unknown',
        count: s.count || 0,
        percentage: (s.percentage || 0) * scaleFactor,
        percentageOriginal: s.percentage || 0,
      })),
    [sources, scaleFactor],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="source"
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
        <Radar
          name="Percentage"
          dataKey="percentage"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.3}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip
          content={<ChartTooltipContent />}
          formatter={(v: number, name: string, props: any) =>
            name === 'Percentage'
              ? [
                  props.payload.percentageOriginal?.toFixed(1) + '%',
                  'Percentage',
                ]
              : [v, name]
          }
        />
      </RadarChart>
    </ChartContainer>
  );
});

export const TicketSourceTableChart = memo(function TicketSourceTableChart({
  sources,
}: {
  sources: SourceData[];
}) {
  const columns: ColumnDef<SourceData>[] = [
    {
      id: '_id',
      header: 'Source',
      accessorKey: '_id',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
      size: 28,
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs truncate">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'count',
      header: 'Data',
      accessorKey: 'count',
      size: 28,
      cell: ({ cell }) => {
        const { count, percentage } = cell.row.original || {};
        return (
          <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
            {count} / {percentage}%
          </RecordTableInlineCell>
        );
      },
    },
  ];
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider data={sources} columns={columns} className="m-3">
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

import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketTags } from '@/report/hooks/useTicketTags';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType, TagData } from '@/report/types';
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
import { ChartExportButton } from '../chart-export/ChartExportButton';

interface TicketTagsProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketTags = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: TicketTagsProps) => {
  const id = title.toLowerCase().replaceAll(' ', '-');
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

  const { ticketTags, loading, error } = useTicketTags({
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

  const allTags = useMemo(() => ticketTags || [], [ticketTags]);
  const {
    pagedData: tags,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allTags);

  const exportColumns = useMemo(
    () => [
      { key: 'name' as const, header: 'Tag' },
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
        data={allTags}
        columns={exportColumns}
        filename="ticket-tags"
      />
    </>
  );

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets by tag"
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
        description="Tickets by tag"
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

  if (!allTags.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No ticket tags found."
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
      description="Tickets by tag"
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
            <TicketTagBarChart tags={tags} />
          )}
          {chartType === ResponsesChartType.Line && (
            <TicketTagLineChart tags={tags} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <TicketTagPieChart tags={tags} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <TicketTagRadarChart tags={tags} />
          )}
          {chartType === ResponsesChartType.Table && (
            <TicketTagTableChart tags={tags} />
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

export const TicketTagBarChart = memo(function TicketTagBarChart({
  tags,
}: {
  tags: TagData[];
}) {
  const chartConfig = useMemo(
    () => ({
      count: { label: 'Count', color: 'var(--primary)' },
      percentage: { label: 'Percentage', color: 'var(--success)' },
    }),
    [],
  );
  const maxCount = useMemo(
    () => Math.max(...tags.map((t) => t.count || 0), 0),
    [tags],
  );
  const maxPct = useMemo(
    () => Math.max(...tags.map((t) => t.percentage || 0), 100),
    [tags],
  );
  const scaleFactor = maxCount > 0 && maxPct > 0 ? maxCount / maxPct : 1;
  const chartData = useMemo(
    () =>
      tags.map((t) => ({
        tag: t.name || 'Unknown',
        count: t.count || 0,
        percentage: t.percentage || 0,
        percentageScaled: (t.percentage || 0) * scaleFactor,
      })),
    [tags, scaleFactor],
  );
  if (!chartData.length) return null;
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Bar dataKey="count" fill="var(--primary)" name="Count" />
        <Bar
          dataKey="percentageScaled"
          fill="var(--success)"
          name="Percentage"
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip
          content={<ChartTooltipContent />}
          formatter={(v: number, name: string, props: any) =>
            name === 'Percentage'
              ? [props.payload.percentage?.toFixed(1) + '%', 'Percentage']
              : [v, name]
          }
        />
      </BarChart>
    </ChartContainer>
  );
});

export const TicketTagLineChart = memo(function TicketTagLineChart({
  tags,
}: {
  tags: TagData[];
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
      tags.map((t) => ({
        tag: t.name || 'Unknown',
        count: t.count || 0,
        percentage: t.percentage || 0,
      })),
    [tags],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
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

export const TicketTagPieChart = memo(function TicketTagPieChart({
  tags,
}: {
  tags: TagData[];
}) {
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const chartConfig = useMemo(
    () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
    [],
  );
  const chartData = useMemo(
    () =>
      tags.map((t, i) => ({
        tag: t.name || 'Unknown',
        count: t.count || 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [tags],
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
          nameKey="tag"
        >
          {chartData.map((item, i) => (
            <Cell
              key={i}
              fill={item.fill}
              opacity={hovered && hovered !== item.tag ? 0.5 : 1}
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

export const TicketTagRadarChart = memo(function TicketTagRadarChart({
  tags,
}: {
  tags: TagData[];
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
      Math.ceil(Math.max(...tags.map((t) => t.count || 0), 0) / 10) * 10 || 100,
    [tags],
  );
  const maxPct = useMemo(
    () => Math.max(...tags.map((t) => t.percentage || 0), 100),
    [tags],
  );
  const scaleFactor = maxCount > 0 && maxPct > 0 ? maxCount / maxPct : 1;
  const chartData = useMemo(
    () =>
      tags.map((t) => ({
        tag: t.name || 'Unknown',
        count: t.count || 0,
        percentage: (t.percentage || 0) * scaleFactor,
        percentageOriginal: t.percentage || 0,
      })),
    [tags, scaleFactor],
  );
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="tag"
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

export const TicketTagTableChart = memo(function TicketTagTableChart({
  tags,
}: {
  tags: TagData[];
}) {
  const columns: ColumnDef<TagData>[] = [
    {
      id: 'name',
      header: 'Tag',
      accessorKey: 'name',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs">
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
      <RecordTable.Provider data={tags} columns={columns} className="m-3">
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

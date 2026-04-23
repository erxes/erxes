import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import {
  useTicketStatusSummary,
  TicketStatusSummaryItem,
} from '@/report/hooks/useTicketStatusSummary';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType } from '@/report/types';
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
  Tooltip,
  XAxis,
  YAxis,
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
  getReportTicketTagFilterAtom,
  getReportCustomerFilterAtom,
  getReportCompanyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { type LegendPayload } from 'recharts';
import { ChartExportButton } from '../chart-export/ChartExportButton';

interface TicketStatusSummaryProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketStatusSummary = ({
  title,
  colSpan = 12,
  onColSpanChange,
}: TicketStatusSummaryProps) => {
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

  const { statusSummary, loading, error } = useTicketStatusSummary({
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

  const data = useMemo(() => statusSummary || [], [statusSummary]);

  const exportColumns = useMemo(
    () => [
      { key: 'name' as const, header: 'Status' },
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
        data={data}
        columns={exportColumns}
        filename="ticket-status-summary"
      />
    </>
  );

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets by status"
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
        description="Tickets by status"
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

  if (!data.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No ticket status data."
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
      description="Tickets by status"
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
            <StatusBarChart data={data} />
          )}
          {chartType === ResponsesChartType.Line && (
            <StatusLineChart data={data} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <StatusPieChart data={data} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <StatusBarChart data={data} />
          )}
          {chartType === ResponsesChartType.Table && (
            <StatusTableChart data={data} />
          )}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const StatusBarChart = memo(function StatusBarChart({
  data,
}: {
  data: TicketStatusSummaryItem[];
}) {
  const chartConfig = useMemo(
    () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
    [],
  );
  const chartData = useMemo(
    () =>
      data.map((s) => ({
        name: s.name,
        count: s.count,
        fill: s.color,
      })),
    [data],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Bar dataKey="count" name="Count">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

const StatusLineChart = memo(function StatusLineChart({
  data,
}: {
  data: TicketStatusSummaryItem[];
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
      data.map((s) => ({
        name: s.name,
        count: s.count,
        percentage: s.percentage,
      })),
    [data],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis yAxisId="count" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="percentage"
          orientation="right"
          tickLine={false}
          axisLine={false}
        />
        <Area
          yAxisId="count"
          dataKey="count"
          type="monotone"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          yAxisId="percentage"
          dataKey="percentage"
          type="monotone"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

const StatusPieChart = memo(function StatusPieChart({
  data,
}: {
  data: TicketStatusSummaryItem[];
}) {
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const chartConfig = useMemo(
    () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
    [],
  );
  const chartData = useMemo(
    () =>
      data.map((s) => ({
        name: s.name,
        count: s.count,
        fill: s.color,
      })),
    [data],
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
          nameKey="name"
        >
          {chartData.map((item, i) => (
            <Cell
              key={i}
              fill={item.fill}
              opacity={hovered && hovered !== item.name ? 0.5 : 1}
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

const StatusTableChart = memo(function StatusTableChart({
  data,
}: {
  data: TicketStatusSummaryItem[];
}) {
  const columns: ColumnDef<TicketStatusSummaryItem>[] = [
    {
      id: 'color',
      header: '',
      accessorKey: 'color',
      size: 20,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-2">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: cell.getValue() as string }}
          />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'name',
      header: 'Status',
      accessorKey: 'name',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs capitalize">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'count',
      header: 'Count',
      accessorKey: 'count',
      size: 60,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs text-right">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'percentage',
      header: '%',
      accessorKey: 'percentage',
      size: 50,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs text-right text-muted-foreground">
          {cell.getValue() as number}%
        </RecordTableInlineCell>
      ),
    },
  ];

  return (
    <div className="bg-sidebar w-full rounded-lg">
      <RecordTable.Provider data={data} columns={columns} className="m-3">
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

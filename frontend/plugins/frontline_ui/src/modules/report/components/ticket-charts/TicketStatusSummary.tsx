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
import { ReportChart, ResponsesChartType } from '@/report/types';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ColumnDef } from '@tanstack/table-core';
import { AreaGradient } from '../chart/AreaGradient';
import { CustomLegendContent } from '../chart/legend';
import { getReportChartTypeAtom, reportChartTypeState } from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import { type LegendPayload } from 'recharts';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';

interface TicketStatusSummaryProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketStatusSummary = ({
  title,
  cardId,
  savedChart,
  colSpan = 12,
  onColSpanChange,
}: TicketStatusSummaryProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useTicketChartCard({ title, cardId, savedChart });
  const setChartType = useSetAtom(getReportChartTypeAtom(id));
  const chartType =
    useAtomValue(reportChartTypeState)[id] ?? ResponsesChartType.Table;

  const { statusSummary, loading, error } = useTicketStatusSummary({
    skip: !filtersRestored,
    variables: { filters: queryFilters },
  });

  const data = useMemo(() => statusSummary || [], [statusSummary]);
  const {
    pagedData: statuses,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(data);

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
      <ReportChartActions
        chartType={TICKET_CHART_TYPES.statusSummary}
        visualType={chartType}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={data}
        columns={exportColumns}
        filename="ticket-status-summary"
      />
    </>
  );

  if (loading || !filtersRestored) {
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
            <Alert.Title>{t('error-loading-data')}</Alert.Title>
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
        <FrontlineCard.Header filter={filterEl} />
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
            <StatusBarChart data={statuses} />
          )}
          {chartType === ResponsesChartType.Line && (
            <StatusLineChart data={statuses} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <StatusPieChart data={statuses} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <StatusBarChart data={statuses} />
          )}
          {chartType === ResponsesChartType.Table && (
            <StatusTableChart data={statuses} />
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

const truncateStatusName = (value: string) =>
  value.length > 18 ? `${value.slice(0, 17)}…` : value;

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
        margin={{ top: 24, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickFormatter={truncateStatusName}
        />
        <YAxis tickLine={false} axisLine={false} />
        <Bar dataKey="count" name="Count">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            className="fill-foreground"
            fontSize={12}
          />
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
        <defs>
          <AreaGradient id="tk-status-primary" color="var(--primary)" />
          <AreaGradient id="tk-status-success" color="var(--success)" />
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickFormatter={truncateStatusName}
        />
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
          fill="url(#tk-status-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          yAxisId="percentage"
          dataKey="percentage"
          type="monotone"
          stroke="var(--success)"
          fill="url(#tk-status-success)"
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
      cell: ({ cell }) => {
        const { name, group } = cell.row.original;
        return (
          <RecordTableInlineCell className="px-4 text-xs">
            <span className={cn('truncate', !group && 'capitalize')}>
              {name}
            </span>
            {group && (
              <span className="text-muted-foreground ml-2 shrink-0 capitalize">
                {group}
              </span>
            )}
          </RecordTableInlineCell>
        );
      },
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

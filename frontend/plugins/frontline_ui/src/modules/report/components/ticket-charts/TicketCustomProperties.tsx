import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useTicketCustomProperties } from '@/report/hooks/useTicketCustomProperties';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ResponsesChartType, TagData } from '@/report/types';
import { memo, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getTicketPropertyFilterVariables } from '@/report/utils';
import { AreaGradient } from '../chart/AreaGradient';
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
  getReportPropertyFilterAtom,
} from '@/report/states';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';
import { ChartExportButton } from '../chart-export/ChartExportButton';

interface TicketCustomPropertiesProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketCustomProperties = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: TicketCustomPropertiesProps) => {
  const { t } = useTranslation('frontline');
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
  const [propertyFilter] = useAtom(getReportPropertyFilterAtom(id));
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    setFilters(getFilters(dateValue || undefined));
  }, [dateValue]);

  const { ticketCustomProperties, loading, error } = useTicketCustomProperties({
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
        ...getTicketPropertyFilterVariables(propertyFilter),
      },
    },
  });

  const allProperties = useMemo(
    () => ticketCustomProperties || [],
    [ticketCustomProperties],
  );
  const {
    pagedData: properties,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allProperties);

  const exportColumns = useMemo(
    () => [
      { key: 'name' as const, header: 'Custom Property' },
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
        data={allProperties}
        columns={exportColumns}
        filename="ticket-custom-properties"
      />
    </>
  );

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Tickets by custom property"
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
        description="Tickets by custom property"
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

  if (!allProperties.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No ticket custom properties found."
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
      description="Tickets by custom property"
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
            <TicketCustomPropertyBarChart properties={properties} />
          )}
          {chartType === ResponsesChartType.Line && (
            <TicketCustomPropertyLineChart properties={properties} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <TicketCustomPropertyPieChart properties={properties} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <TicketCustomPropertyRadarChart properties={properties} />
          )}
          {chartType === ResponsesChartType.Table && (
            <TicketCustomPropertyTableChart properties={properties} />
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

export const TicketCustomPropertyBarChart = memo(
  function TicketCustomPropertyBarChart({
    properties,
  }: {
    properties: TagData[];
  }) {
    const chartConfig = useMemo(
      () => ({
        count: { label: 'Count', color: 'var(--primary)' },
        percentage: { label: 'Percentage', color: 'var(--success)' },
      }),
      [],
    );
    const maxCount = useMemo(
      () => Math.max(...properties.map((p) => p.count || 0), 0),
      [properties],
    );
    const maxPct = useMemo(
      () => Math.max(...properties.map((p) => p.percentage || 0), 100),
      [properties],
    );
    const scaleFactor = maxCount > 0 && maxPct > 0 ? maxCount / maxPct : 1;
    const chartData = useMemo(
      () =>
        properties.map((p) => ({
          property: p.name || 'Unknown',
          count: p.count || 0,
          percentage: p.percentage || 0,
          percentageScaled: (p.percentage || 0) * scaleFactor,
        })),
      [properties, scaleFactor],
    );
    if (!chartData.length) return null;
    return (
      <ChartContainer config={chartConfig} className="aspect-video w-full">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="property" tickLine={false} axisLine={false} />
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
          <Legend
            content={(props: any) => <CustomLegendContent {...props} />}
          />
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
  },
);

export const TicketCustomPropertyLineChart = memo(
  function TicketCustomPropertyLineChart({
    properties,
  }: {
    properties: TagData[];
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
        properties.map((p) => ({
          property: p.name || 'Unknown',
          count: p.count || 0,
          percentage: p.percentage || 0,
        })),
      [properties],
    );
    return (
      <ChartContainer config={chartConfig} className="aspect-video w-full">
        <AreaChart data={chartData} margin={{ top: 10 }}>
          <defs>
            <AreaGradient id="tk-props-primary" color="var(--primary)" />
            <AreaGradient id="tk-props-success" color="var(--success)" />
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="property" tickLine={false} axisLine={false} />
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
            fill="url(#tk-props-primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeLinecap="round"
          />
          <Area
            yAxisId="percentage"
            dataKey="percentage"
            type="monotone"
            stroke="var(--success)"
            fill="url(#tk-props-success)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            strokeLinecap="round"
          />
          <Legend
            content={(props: any) => <CustomLegendContent {...props} />}
          />
          <Tooltip content={<ChartTooltipContent />} />
        </AreaChart>
      </ChartContainer>
    );
  },
);

export const TicketCustomPropertyPieChart = memo(
  function TicketCustomPropertyPieChart({
    properties,
  }: {
    properties: TagData[];
  }) {
    const [hovered, setHovered] = useState<string | undefined>(undefined);
    const chartConfig = useMemo(
      () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
      [],
    );
    const chartData = useMemo(
      () =>
        properties.map((p, i) => ({
          property: p.name || 'Unknown',
          count: p.count || 0,
          fill: CHART_COLORS[i % CHART_COLORS.length],
        })),
      [properties],
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
            nameKey="property"
          >
            {chartData.map((item, i) => (
              <Cell
                key={i}
                fill={item.fill}
                opacity={hovered && hovered !== item.property ? 0.5 : 1}
              />
            ))}
          </Pie>
          <Legend
            content={(props: any) => (
              <CustomLegendContent
                {...props}
                onMouseEnter={(d: LegendPayload) =>
                  setHovered(d.value as string)
                }
                onMouseLeave={() => setHovered(undefined)}
              />
            )}
          />
          <Tooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    );
  },
);

export const TicketCustomPropertyRadarChart = memo(
  function TicketCustomPropertyRadarChart({
    properties,
  }: {
    properties: TagData[];
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
        Math.ceil(Math.max(...properties.map((p) => p.count || 0), 0) / 10) *
          10 || 100,
      [properties],
    );
    const maxPct = useMemo(
      () => Math.max(...properties.map((p) => p.percentage || 0), 100),
      [properties],
    );
    const scaleFactor = maxCount > 0 && maxPct > 0 ? maxCount / maxPct : 1;
    const chartData = useMemo(
      () =>
        properties.map((p) => ({
          property: p.name || 'Unknown',
          count: p.count || 0,
          percentage: (p.percentage || 0) * scaleFactor,
          percentageOriginal: p.percentage || 0,
        })),
      [properties, scaleFactor],
    );
    return (
      <ChartContainer config={chartConfig} className="aspect-video w-full">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="property"
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
          <Legend
            content={(props: any) => <CustomLegendContent {...props} />}
          />
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
  },
);

export const TicketCustomPropertyTableChart = memo(
  function TicketCustomPropertyTableChart({
    properties,
  }: {
    properties: TagData[];
  }) {
    const columns: ColumnDef<TagData>[] = [
      {
        id: 'name',
        header: 'Custom Property',
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
        <RecordTable.Provider
          data={properties}
          columns={columns}
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
  },
);

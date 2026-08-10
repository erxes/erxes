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
import { TagData } from '@/report/types';
import { memo, useMemo, useState, useEffect } from 'react';
import { IconChevronLeft, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  LabelList,
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
import { AreaGradient } from '../chart/AreaGradient';
import { CustomLegendContent } from '../chart/legend';
import { TicketReportFilter } from '../filter-popover/ticket-report-filter';
import {
  useChartPagination,
  ChartPagination,
} from '../chart-pagination/ChartPagination';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useTicketChartCard } from '@/report/hooks/useTicketChartCard';
import { ReportChart } from '@/report/types';
import { TICKET_CHART_TYPES } from '@/report/types/component-registry';

interface TicketCustomPropertiesProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const TicketCustomProperties = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: TicketCustomPropertiesProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useTicketChartCard({ title, cardId, savedChart });
  const { groupPropertyId } = filterConfig;
  const [drilldown, setDrilldown] = useState<
    { value: string; label: string; count: number } | undefined
  >(undefined);

  useEffect(() => {
    setDrilldown(undefined);
  }, [groupPropertyId]);

  const { ticketCustomProperties, loading, error } = useTicketCustomProperties({
    skip: !filtersRestored,
    variables: {
      filters: {
        ...queryFilters,
        groupPropertyValue: drilldown?.value || undefined,
      },
    },
  });

  const canDrill = Boolean(groupPropertyId) && !drilldown;
  const handleBarClick = (value: string, label: string, count: number) =>
    setDrilldown({ value, label, count });

  const allProperties = useMemo(
    () => ticketCustomProperties || [],
    [ticketCustomProperties],
  );

  const isGrouped = allProperties.some((p) => p.group);
  const {
    pagedData: properties,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(allProperties);
  const displayProperties = isGrouped ? allProperties : properties;

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
      <ReportChartActions
        chartType={TICKET_CHART_TYPES.customProperties}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={allProperties}
        columns={exportColumns}
        filename="ticket-custom-properties"
      />
    </>
  );

  if (loading || !filtersRestored) {
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
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          {drilldown && (
            <button
              type="button"
              onClick={() => setDrilldown(undefined)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 px-4 pt-3 text-sm font-medium"
            >
              <IconChevronLeft className="size-4" />
              <span className="truncate">{drilldown.label}</span>
            </button>
          )}
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
        {drilldown && (
          <button
            type="button"
            onClick={() => setDrilldown(undefined)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 px-4 pt-4 text-sm font-medium"
          >
            <IconChevronLeft className="size-4" />
            <span className="truncate">{drilldown.label}</span>
          </button>
        )}
        <div className={cn('w-full px-4 pb-4 pt-4')}>
          <TicketCustomPropertyRankedBars
            properties={displayProperties}
            total={drilldown?.count}
            onBarClick={canDrill ? handleBarClick : undefined}
          />
        </div>
        {!isGrouped && (
          <ChartPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const VALUE_BAR_COLORS = [
  'bg-indigo-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-lime-500',
  'bg-orange-500',
];

const RankMetric = ({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) => (
  <div>
    <div
      className={cn(
        'text-2xl font-bold tabular-nums',
        accent && 'text-primary',
      )}
    >
      {value}
    </div>
    <div className="text-muted-foreground text-xs">{label}</div>
  </div>
);

const TicketCustomPropertyRankedBars = memo(
  function TicketCustomPropertyRankedBars({
    properties,
    companyLabel,
    total: totalOverride,
    onBarClick,
  }: {
    properties: TagData[];
    companyLabel?: string;
    total?: number;
    onBarClick?: (id: string, name: string, count: number) => void;
  }) {
    const { t } = useTranslation('frontline');

    const total =
      totalOverride ?? properties.reduce((sum, p) => sum + (p.count || 0), 0);
    const max = Math.max(...properties.map((p) => p.count || 0), 1);
    const top2 = (properties[0]?.count || 0) + (properties[1]?.count || 0);
    const top2Pct = total ? Math.min(100, Math.round((top2 / total) * 100)) : 0;
    const pctOf = (n: number) =>
      total ? Math.min(100, Math.round((n / total) * 100)) : 0;

    const isGrouped = properties.some((p) => p.group);
    const groups: { label: string; rows: TagData[] }[] = [];
    if (isGrouped) {
      const index = new Map<string, number>();
      for (const p of properties) {
        const key = p.group || p.name;
        if (!index.has(key)) {
          index.set(key, groups.length);
          groups.push({ label: key, rows: [] });
        }
        groups[index.get(key)!].rows.push(p);
      }
    }
    const typesCount = isGrouped ? groups.length : properties.length;

    if (!properties.length) return null;

    const renderBar = (
      p: TagData,
      key: string,
      isTop: boolean,
      rank?: number,
    ) => {
      const count = p.count || 0;
      const clickable = Boolean(onBarClick);
      return (
        <div
          key={key}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onClick={
            clickable
              ? () => onBarClick?.(String(p._id), p.name, count)
              : undefined
          }
          className={cn(
            'flex items-center gap-3 py-1.5',
            clickable && 'hover:bg-accent/40 cursor-pointer rounded-md',
          )}
        >
          {rank !== undefined ? (
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums',
                isTop
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {rank}
            </span>
          ) : (
            <span
              className={cn(
                'ml-1.5 size-1.5 shrink-0 rounded-full',
                isTop ? 'bg-primary' : 'bg-muted-foreground/40',
              )}
            />
          )}
          <span className="w-44 shrink-0 truncate text-sm">{p.name}</span>
          <span className="bg-muted h-[22px] flex-1 overflow-hidden rounded-md">
            <span
              className={cn(
                'block h-full rounded-md transition-[width] duration-500',
                isTop ? 'bg-primary' : 'bg-muted-foreground/50',
              )}
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="w-20 shrink-0 text-right text-sm tabular-nums">
            <b className="font-semibold">{count}</b>
            <span className="text-muted-foreground ml-1.5 text-xs">
              {pctOf(count)}%
            </span>
          </span>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-6 border-b pb-3">
          <RankMetric value={total} label={t('total-tickets')} />
          <RankMetric value={typesCount} label={t('report-value-types')} />
          {!isGrouped && (
            <RankMetric value={`${top2Pct}%`} label={t('top-2-share')} accent />
          )}
        </div>

        {isGrouped ? (
          <div className="flex flex-col gap-4">
            {groups.map((g) => {
              const groupTotal = g.rows.reduce(
                (sum, r) => sum + (r.count || 0),
                0,
              );
              const isSingle =
                g.rows.length === 1 && g.rows[0].name === g.label;
              return (
                <div key={g.label} className="flex flex-col gap-1.5">
                  <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-1.5">
                    <span className="truncate text-sm font-semibold">
                      {g.label}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {groupTotal} · {pctOf(groupTotal)}%
                    </span>
                  </div>
                  {!isSingle && (
                    <div className="flex flex-col gap-1 pl-1">
                      {g.rows.map((r, i) => {
                        const count = r.count || 0;
                        return (
                          <div key={r._id} className="flex items-center gap-2">
                            <span
                              className={cn(
                                'size-2 shrink-0 rounded-full',
                                VALUE_BAR_COLORS[i % VALUE_BAR_COLORS.length],
                              )}
                            />
                            <span
                              title={r.name}
                              className="text-muted-foreground min-w-0 flex-1 truncate text-sm"
                            >
                              {r.name}
                            </span>
                            <span className="bg-muted h-4 w-40 shrink-0 overflow-hidden rounded">
                              <span
                                className={cn(
                                  'block h-full rounded transition-[width] duration-500',
                                  VALUE_BAR_COLORS[i % VALUE_BAR_COLORS.length],
                                )}
                                style={{ width: `${pctOf(count)}%` }}
                              />
                            </span>
                            <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                              <b className="font-medium">{count}</b>
                              <span className="text-muted-foreground ml-1 text-xs">
                                {pctOf(count)}%
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col">
            {properties.map((p, index) =>
              renderBar(p, p._id, index < 2, index + 1),
            )}
          </div>
        )}

        {!isGrouped && properties.length >= 2 && (
          <div className="bg-primary/5 border-primary/20 text-foreground flex items-start gap-2.5 rounded-xl border p-3 text-sm">
            <IconShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
            <div>
              <b className="font-semibold">{t('top-2')}:</b>{' '}
              {companyLabel && (
                <span className="text-muted-foreground">{companyLabel} · </span>
              )}
              {properties[0].name} ({properties[0].count}) ·{' '}
              {properties[1].name} ({properties[1].count}) —{' '}
              <b className="font-semibold">{top2Pct}%</b>
            </div>
          </div>
        )}
      </div>
    );
  },
);

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
    onBarClick,
  }: {
    properties: TagData[];
    onBarClick?: (id: string, name: string) => void;
  }) {
    const chartConfig = useMemo(
      () => ({ count: { label: 'Count', color: 'var(--primary)' } }),
      [],
    );
    const chartData = useMemo(
      () =>
        properties.map((p) => ({
          id: p._id,
          property: p.name || 'Unknown',
          count: p.count || 0,
          percentage: p.percentage || 0,
        })),
      [properties],
    );
    const topThreshold = useMemo(() => {
      const sorted = [...chartData.map((d) => d.count)].sort((a, b) => b - a);
      return sorted[1] ?? sorted[0] ?? 0;
    }, [chartData]);
    const height = Math.max(220, chartData.length * 40);
    if (!chartData.length) return null;
    return (
      <div className="w-full" style={{ height }}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 44, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="property"
              tickLine={false}
              axisLine={false}
              width={210}
              tick={{ fontSize: 12 }}
              interval={0}
              tickFormatter={(value: string) =>
                value.length > 34 ? `${value.slice(0, 33)}…` : value
              }
            />
            <Bar
              dataKey="count"
              name="Count"
              radius={[0, 4, 4, 0]}
              cursor={onBarClick ? 'pointer' : undefined}
              onClick={
                onBarClick
                  ? (data: any) => {
                      const row = data?.payload ?? data;
                      if (row?.id) {
                        onBarClick(String(row.id), row.property);
                      }
                    }
                  : undefined
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    topThreshold > 0 && entry.count >= topThreshold
                      ? 'var(--primary)'
                      : 'var(--muted-foreground)'
                  }
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
              content={<ChartTooltipContent />}
              formatter={(v: number, _name: string, props: any) => [
                `${v} (${props.payload.percentage}%)`,
                'Count',
              ]}
            />
          </BarChart>
        </ChartContainer>
      </div>
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

import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { useConversationSources } from '../hooks/useConversationSource';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { memo, useMemo, useState, useEffect } from 'react';
import { ResponsesChartType, SourceData } from '../types';
import { useAtom } from 'jotai';
import {
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportSourceFilterAtom,
} from '../states';
import { SelectChartType } from './select-chart-type/SelectChartType';
import { ColumnDef } from '@tanstack/table-core';
import { DataKey } from 'recharts/types/util/types';
import { DateSelector } from './date-selector/DateSelector';
import { getFilters } from '../utils/dateFilters';
import { CustomLegendContent } from './chart/legend';
import { type LegendPayload } from 'recharts';

interface FrontlineReportBySourceProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

interface SourceCardHeaderProps {
  chartType: ResponsesChartType;
  setChartType: (chartType: ResponsesChartType) => void;
  sourceFilter: string;
  dateValue: string;
  onSourceFilterChange: (value: string) => void;
}

interface SourceChartProps {
  conversationSources: SourceData[];
}

export const FrontlineReportBySource = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: FrontlineReportBySourceProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(id));
  const [sourceFilter, setSourceFilter] = useAtom(
    getReportSourceFilterAtom(id),
  );
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    const newFilters = getFilters(dateValue || undefined);
    setFilters(newFilters);
  }, [dateValue]);

  const { conversationSources, loading, error } = useConversationSources({
    variables: {
      filters: {
        ...filters,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
  });

  const handleDateValueChange = (value: string) => {
    setDateValue(value);
  };
  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Conversation statistics by source"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header
          filter={
            <>
              <GroupSelect
                value={sourceFilter}
                onValueChange={setSourceFilter}
              />
              <DateSelector
                value={dateValue}
                onValueChange={handleDateValueChange}
              />
              <SelectChartType onValueChange={setChartType} value={chartType} />
            </>
          }
        />
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
        description="Conversation statistics by source"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>
              {error.message || 'Failed to load conversation sources'}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!conversationSources || conversationSources.length === 0) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No conversation sources found."
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header
          filter={
            <>
              <GroupSelect
                value={sourceFilter}
                onValueChange={setSourceFilter}
              />
              <DateSelector
                value={dateValue}
                onValueChange={handleDateValueChange}
              />
            </>
          }
        />
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
      description="Conversation statistics by source"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <>
            <GroupSelect
              value={sourceFilter}
              onValueChange={setSourceFilter}
            />
            <DateSelector
              value={dateValue}
              onValueChange={handleDateValueChange}
            />
            <SelectChartType onValueChange={setChartType} value={chartType} />
          </>
        }
      />
      <FrontlineCard.Content>
        <div
          className={cn(
            {
              'p-4': chartType !== ResponsesChartType.Table,
            },
            'w-full',
          )}
        >
          {chartType === ResponsesChartType.Bar && (
            <SourceBarChart conversationSources={conversationSources || []} />
          )}
          {chartType === ResponsesChartType.Line && (
            <SourceLineChart conversationSources={conversationSources} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <SourcePieChart conversationSources={conversationSources} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <SourceRadarChart conversationSources={conversationSources} />
          )}
          {chartType === ResponsesChartType.Table && (
            <SourceRecordTableChart conversationSources={conversationSources} />
          )}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

export const SourceCardHeader = ({
  chartType,
  setChartType,
  sourceFilter,
  onSourceFilterChange,
}: SourceCardHeaderProps) => {
  return (
    <>
      <GroupSelect value={sourceFilter} onValueChange={onSourceFilterChange} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
    </>
  );
};

export const SourceBarChart = memo(function SourceBarChart({
  conversationSources,
}: SourceChartProps) {
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );
  const chartData = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) {
      return [];
    }
    return conversationSources
      .filter((item) => item != null)
      .map((item) => {
        const count =
          typeof item.count === 'number' && !isNaN(item.count) ? item.count : 0;
        const source = String(item.name || item._id || 'Unknown').trim();

        return {
          source: source || 'Unknown',
          count: Math.max(0, count),
        };
      })
      .filter((item) => item.source && item.source !== '');
  }, [conversationSources]);

  if (chartData.length === 0) {
    return null;
  }

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
        <Legend
          content={(props: any) => (
            <CustomLegendContent {...props} />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

export const SourceLineChart = memo(function SourceLineChart({
  conversationSources,
}: SourceChartProps) {
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
      percentage: {
        label: 'Percentage',
        color: 'var(--success)',
      },
    }),
    [],
  );
  const chartData = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) {
      return [];
    }
    return conversationSources.map((item) => ({
      source: item.name || item._id || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
    }));
  }, [conversationSources]);

  const maxCount = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((item) => item.count || 0), 0);
  }, [chartData]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map((item) => item.percentage || 0), 100);
  }, [chartData]);

  const countYAxisDomain = useMemo(() => {
    if (maxCount === 0) return [0, 100];
    const max = Math.ceil(maxCount / 50) * 50;
    return [0, max];
  }, [maxCount]);

  const percentageYAxisDomain = useMemo(() => {
    const max = Math.ceil(maxPercentage / 10) * 10;
    return [0, max];
  }, [maxPercentage]);
  const [hoveringDataKey, setHoveringDataKey] = useState<
    DataKey<any> | undefined
  >(undefined);

  let countOpacity = 1;
  let percentageOpacity = 1;

  if (hoveringDataKey === 'percentage') {
    countOpacity = 0.5;
  }

  if (hoveringDataKey === 'count') {
    percentageOpacity = 0.5;
  }

  const handleMouseEnter = (payload: LegendPayload) => {
    setHoveringDataKey(payload.dataKey);
  };

  const handleMouseLeave = () => {
    setHoveringDataKey(undefined);
  };

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="source" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="count"
          domain={countYAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="percentage"
          orientation="right"
          domain={percentageYAxisDomain}
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
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

export const SourcePieChart = memo(function SourcePieChart({
  conversationSources,
}: SourceChartProps) {
  const [hoveredSource, setHoveredSource] = useState<string | undefined>(
    undefined,
  );
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );
  const chartData = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) {
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
    return conversationSources.map((item, index) => ({
      source: item.name || item._id || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationSources]);

  const handleMouseEnter = (source: string) => {
    setHoveredSource(source);
  };
  const handleMouseLeave = () => {
    setHoveredSource(undefined);
  };

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="source"
        >
          {chartData?.map((item, index) => (
            <Cell
              key={`cell-${index}`}
              fill={item.fill}
              opacity={hoveredSource && hoveredSource !== item.source ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(data: LegendPayload) => {
                const source = data.value as string;
                if (source) {
                  handleMouseEnter(source);
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


export const SourceRadarChart = memo(function SourceRadarChart({
  conversationSources,
}: SourceChartProps) {
  const chartConfig = useMemo(
    () => ({
      count: {
        label: 'Count',
        color: 'var(--primary)',
      },
      percentage: {
        label: 'Percentage',
        color: 'var(--success)',
      },
    }),
    [],
  );

  const maxCount = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) return 100;
    const max = Math.max(
      ...conversationSources.map((item) => item.count || 0),
      0,
    );
    return Math.ceil(max / 10) * 10 || 100;
  }, [conversationSources]);

  const maxPercentage = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) return 100;
    return Math.max(
      ...conversationSources.map((item) => item.percentage || 0),
      100,
    );
  }, [conversationSources]);

  const chartData = useMemo(() => {
    if (!conversationSources || conversationSources.length === 0) {
      return [];
    }
    const scaleFactor =
      maxCount > 0 && maxPercentage > 0 ? maxCount / maxPercentage : 1;
    return conversationSources.map((item) => ({
      source: item.name || item._id || 'Unknown',
      count: item.count || 0,
      percentage: (item.percentage || 0) * scaleFactor,
      percentageOriginal: item.percentage || 0,
    }));
  }, [conversationSources, maxCount, maxPercentage]);

  const domainMax = useMemo(() => {
    return Math.max(maxCount, maxPercentage > 0 ? maxCount : 100);
  }, [maxCount, maxPercentage]);

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
          domain={[0, domainMax]}
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
          content={(props: any) => (
            <CustomLegendContent {...props} />
          )}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          formatter={(value: number, name: string, props: any) => {
            if (name === 'Percentage') {
              return [
                props.payload.percentageOriginal?.toFixed(1) + '%',
                'Percentage',
              ];
            }
            return [value, name];
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
});

export const SourceRecordTableChart = memo(function SourceRecordTableChart({
  conversationSources,
}: SourceChartProps) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={conversationSources}
        columns={sourceRecordTableColumns}
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

export const sourceRecordTableColumns: ColumnDef<SourceData>[] = [
  {
    id: '_id',
    header: 'Source',
    accessorKey: '_id',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-4 text-xs">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 28,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-4 text-xs truncate">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'count',
    header: 'Data',
    accessorKey: 'count',
    cell: ({ cell }) => {
      const { count, percentage } = cell.row.original || {};
      return (
        <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
          {count} / {percentage}%
        </RecordTableInlineCell>
      );
    },
    size: 28,
  },
];

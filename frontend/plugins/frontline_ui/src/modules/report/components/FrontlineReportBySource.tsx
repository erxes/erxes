import {
  Alert,
  ChartContainer,
  cn,
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
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
  LegendPayload,
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
import { memo, useMemo, useState } from 'react';
import { ResponsesChartType, SourceData } from '../types';
import { SelectChartType } from './select-chart-type/SelectChartType';
import { ColumnDef } from '@tanstack/table-core';
import { DataKey } from 'recharts/types/util/types';

interface FrontlineReportBySourceProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

interface SourceCardHeaderProps {
  chartType: ResponsesChartType;
  setChartType: (chartType: ResponsesChartType) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
}

interface SourceChartProps {
  conversationSources: SourceData[];
}

export const FrontlineReportBySource = ({
  title,
  colSpan = 1,
  onColSpanChange,
}: FrontlineReportBySourceProps) => {
  const [chartType, setChartType] = useState<ResponsesChartType>(
    ResponsesChartType.Bar,
  );
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const id = title.toLowerCase().replace(/\s+/g, '-');

  const { conversationSources, loading, error } = useConversationSources({
    variables: {
      filters: {
        limit: 10,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
  });

  if (loading) return <Skeleton className="w-full h-48" />;

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
          <SourceCardHeader
            chartType={chartType}
            setChartType={setChartType}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
          />
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
          {chartType === ResponsesChartType.Donut && (
            <SourceDonutChart conversationSources={conversationSources} />
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
        <Legend />
        <Tooltip />
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <Tooltip />
      </AreaChart>
    </ChartContainer>
  );
});

export const SourcePieChart = memo(function SourcePieChart({
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
    const colors = [
      'var(--primary)',
      'var(--success)',
      'var(--warning)',
      'var(--destructive)',
      'var(--info)',
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    return conversationSources.map((item, index) => ({
      source: item.name || item._id || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationSources]);

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={0}
          label={({ source, count, percentage }) =>
            `${source}: ${count} (${percentage.toFixed(1)}%)`
          }
          nameKey="source"
        />
        {chartData?.map((item) => (
          <Cell key={item.source} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
});

export const SourceDonutChart = memo(function SourceDonutChart({
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
    const colors = [
      'var(--primary)',
      'var(--success)',
      'var(--warning)',
      'var(--destructive)',
      'var(--info)',
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    return conversationSources.map((item, index) => ({
      source: item.name || item._id || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationSources]);

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          label={({ source, count, percentage }) =>
            `${source}: ${count} (${percentage.toFixed(1)}%)`
          }
          nameKey="source"
        />
        {chartData?.map((item) => (
          <Cell key={item.source} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
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
    // Scale percentage to match count range for better visualization
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
        <Legend />
        <Tooltip
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

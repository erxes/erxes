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
import { useConversationTags } from '../hooks/useConversationTags';
import { DateSelector } from './date-selector/DateSelector';
import { SelectChartType } from './select-chart-type/SelectChartType';
import { ColumnDef } from '@tanstack/table-core';
import { getFilters } from '../utils/dateFilters';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { ResponsesChartType, TagData } from '../types';

interface FrontlineReportByTagProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

interface TagCardHeaderProps {
  chartType: ResponsesChartType;
  setChartType: (chartType: ResponsesChartType) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  dateValue: string;
  onDateValueChange: (value: string) => void;
}

interface TagChartProps {
  conversationTags: TagData[];
}

export const FrontlineReportByTag = ({
  title,
  colSpan = 1,
  onColSpanChange,
}: FrontlineReportByTagProps) => {
  const [chartType, setChartType] = useState<ResponsesChartType>(
    ResponsesChartType.Table,
  );
  const [dateValue, setDateValue] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [filters, setFilters] = useState(() => getFilters());
  const id = title.toLowerCase().replace(/\s+/g, '-');

  const { conversationTags, loading, error } = useConversationTags({
    variables: {
      filters: {
        ...filters,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
  });

  const handleDateValueChange = (value: string) => {
    setDateValue(value);
    const newFilters = getFilters(value || undefined);
    setFilters(newFilters);
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
  };

  if (loading) return <Skeleton className="w-full h-48" />;

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="Conversation statistics by tag"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>
              {error.message || 'Failed to load conversation tags'}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!conversationTags || conversationTags.length === 0) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No conversation tags found."
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
      description="Conversation statistics by tag"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <TagCardHeader
            chartType={chartType}
            setChartType={setChartType}
            sourceFilter={sourceFilter}
            onSourceFilterChange={handleSourceFilterChange}
            dateValue={dateValue}
            onDateValueChange={handleDateValueChange}
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
            <TagBarChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Line && (
            <TagLineChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <TagPieChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Donut && (
            <TagDonutChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <TagRadarChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Table && (
            <TagRecordTableChart conversationTags={conversationTags} />
          )}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

export const TagCardHeader = ({
  chartType,
  setChartType,
  sourceFilter,
  onSourceFilterChange,
  dateValue,
  onDateValueChange,
}: TagCardHeaderProps) => {
  return (
    <>
      <GroupSelect value={sourceFilter} onValueChange={onSourceFilterChange} />
      <DateSelector value={dateValue} onValueChange={onDateValueChange} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
    </>
  );
};

export const TagBarChart = memo(function TagBarChart({
  conversationTags,
}: TagChartProps) {
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
    if (!conversationTags || conversationTags.length === 0) {
      return [];
    }
    return conversationTags.map((item) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
    }));
  }, [conversationTags]);

  const maxCount = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((item) => item.count || 0), 0);
  }, [chartData]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map((item) => item.percentage || 0), 100);
  }, [chartData]);

  const scaledChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    const scaleFactor =
      maxCount > 0 && maxPercentage > 0 ? maxCount / maxPercentage : 1;
    return chartData.map((item) => {
      const count = item.count || 0;
      const percentage = item.percentage || 0;
      const percentageScaled = Number.isFinite(percentage * scaleFactor)
        ? percentage * scaleFactor
        : 0;
      return {
        ...item,
        count,
        percentage,
        percentageScaled,
      };
    });
  }, [chartData, maxCount, maxPercentage]);

  const stackedYAxisDomain = useMemo(() => {
    if (scaledChartData.length === 0) return [0, 100];
    const stackedValues = scaledChartData.map(
      (item) => (item.count || 0) + (item.percentageScaled || 0),
    );
    if (stackedValues.length === 0) return [0, 100];
    const maxStacked = Math.max(...stackedValues, 0);
    if (maxStacked === 0 || !Number.isFinite(maxStacked)) return [0, 100];
    const max = Math.ceil(maxStacked / 50) * 50;
    return [0, max];
  }, [scaledChartData]);

  if (scaledChartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <BarChart data={scaledChartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
        <YAxis
          domain={stackedYAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Bar
          dataKey="count"
          fill="var(--primary)"
          stackId="stack-tag"
          name="Count"
        />
        <Bar
          dataKey="percentageScaled"
          fill="var(--success)"
          stackId="stack-tag"
          name="Percentage"
        />
        <Legend />
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            if (name === 'Percentage') {
              return [props.payload.percentage?.toFixed(1) + '%', 'Percentage'];
            }
            return [value, name === 'Count' ? 'Count' : name];
          }}
        />
      </BarChart>
    </ChartContainer>
  );
});

export const TagLineChart = memo(function TagLineChart({
  conversationTags,
}: TagChartProps) {
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
    if (!conversationTags || conversationTags.length === 0) {
      return [];
    }
    return conversationTags.map((item) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
    }));
  }, [conversationTags]);

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

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tag" tickLine={false} axisLine={false} />
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
        <Legend />
        <Tooltip />
      </AreaChart>
    </ChartContainer>
  );
});

export const TagPieChart = memo(function TagPieChart({
  conversationTags,
}: TagChartProps) {
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
    if (!conversationTags || conversationTags.length === 0) {
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
    return conversationTags.map((item, index) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationTags]);

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
          label={({ tag, count, percentage }) =>
            `${tag}: ${count} (${percentage.toFixed(1)}%)`
          }
          nameKey="tag"
        />
        {chartData?.map((item) => (
          <Cell key={item.tag} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
});

export const TagDonutChart = memo(function TagDonutChart({
  conversationTags,
}: TagChartProps) {
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
    if (!conversationTags || conversationTags.length === 0) {
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
    return conversationTags.map((item, index) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationTags]);

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
          label={({ tag, count, percentage }) =>
            `${tag}: ${count} (${percentage.toFixed(1)}%)`
          }
          nameKey="tag"
        />
        {chartData?.map((item) => (
          <Cell key={item.tag} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
});

export const TagRadarChart = memo(function TagRadarChart({
  conversationTags,
}: TagChartProps) {
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
    if (!conversationTags || conversationTags.length === 0) return 100;
    const max = Math.max(...conversationTags.map((item) => item.count || 0), 0);
    return Math.ceil(max / 10) * 10 || 100;
  }, [conversationTags]);

  const maxPercentage = useMemo(() => {
    if (!conversationTags || conversationTags.length === 0) return 100;
    return Math.max(
      ...conversationTags.map((item) => item.percentage || 0),
      100,
    );
  }, [conversationTags]);

  const chartData = useMemo(() => {
    if (!conversationTags || conversationTags.length === 0) {
      return [];
    }

    const scaleFactor =
      maxCount > 0 && maxPercentage > 0 ? maxCount / maxPercentage : 1;
    return conversationTags.map((item) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: (item.percentage || 0) * scaleFactor,
      percentageOriginal: item.percentage || 0,
    }));
  }, [conversationTags, maxCount, maxPercentage]);

  const domainMax = useMemo(() => {
    return Math.max(maxCount, maxPercentage > 0 ? maxCount : 100);
  }, [maxCount, maxPercentage]);

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

export const TagRecordTableChart = memo(function TagRecordTableChart({
  conversationTags,
}: TagChartProps) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={conversationTags}
        columns={tagRecordTableColumns}
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

export const tagRecordTableColumns: ColumnDef<TagData>[] = [
  {
    id: 'name',
    header: 'Tag',
    accessorKey: 'name',
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

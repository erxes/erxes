import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { useConversationTags } from '@/report/hooks/useConversationTags';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { ColumnDef } from '@tanstack/table-core';
import { getFilters } from '@/report/utils/dateFilters';
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
import { ResponsesChartType, TagData } from '@/report/types';
import { CustomLegendContent } from '../chart/legend';
import { type LegendPayload } from 'recharts';
import { useAtom } from 'jotai';
import {
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportSourceFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
} from '@/report/states';
import { ReportFilter } from '../filter-popover/report-filter';

interface ConversationTagProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}


interface TagChartProps {
  conversationTags: TagData[];
}

export const ConversationTag = ({
  title,
  colSpan = 6,
  onColSpanChange,
}: ConversationTagProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));
  const [dateValue, setDateValue] = useAtom(getReportDateFilterAtom(id));
  const [sourceFilter, setSourceFilter] = useAtom(
    getReportSourceFilterAtom(id),
  );
  const [channelFilter, setChannelFilter] = useAtom(
    getReportChannelFilterAtom(id),
  );
  const [memberFilter, setMemberFilter] = useAtom(
    getReportMemberFilterAtom(id),
  );
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    const newFilters = getFilters(dateValue || undefined);
    setFilters(newFilters);
  }, [dateValue]);

  const { conversationTags, loading, error } = useConversationTags({
    variables: {
      filters: {
        ...filters,
        channelIds: channelFilter.length ? channelFilter : undefined,
        memberIds: memberFilter.length ? memberFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      },
    },
  });


  if (loading) {
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
            <>
              <ReportFilter cardId={id} />
              <SelectChartType value={chartType} onValueChange={setChartType} />
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
        <FrontlineCard.Header filter={<ReportFilter cardId={id} />} />
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
          <>
            <ReportFilter cardId={id} />
            <SelectChartType value={chartType} onValueChange={setChartType} />
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
            <TagBarChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Line && (
            <TagLineChart conversationTags={conversationTags} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <TagPieChart conversationTags={conversationTags} />
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
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip
          content={<ChartTooltipContent />}
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
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

export const TagPieChart = memo(function TagPieChart({
  conversationTags,
}: TagChartProps) {
  const [hoveredTag, setHoveredTag] = useState<string | undefined>(undefined);
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
    return conversationTags.map((item, index) => ({
      tag: item.name || 'Unknown',
      count: item.count || 0,
      percentage: item.percentage || 0,
      fill: colors[index % colors.length],
    }));
  }, [conversationTags]);

  const handleMouseEnter = (tag: string) => {
    setHoveredTag(tag);
  };
  const handleMouseLeave = () => {
    setHoveredTag(undefined);
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
          nameKey="tag"
        >
          {chartData?.map((item, index) => (
            <Cell
              key={`cell-${index}`}
              fill={item.fill}
              opacity={hoveredTag && hoveredTag !== item.tag ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(data: LegendPayload) => {
                const tag = data.value as string;
                if (tag) {
                  handleMouseEnter(tag);
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
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
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

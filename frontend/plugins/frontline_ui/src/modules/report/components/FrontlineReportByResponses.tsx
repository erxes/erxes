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
import { useConversationResponses } from '../hooks/useConversationResponses';
import { DateSelector } from './date-selector/DateSelector';
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
import { ResponsesChartType, ConversationUserMessageStat } from '../types';
import { SelectChartType } from './select-chart-type/SelectChartType';
import { ColumnDef } from '@tanstack/table-core';
import { IUser, MembersInline } from 'ui-modules';

interface FrontlineReportByResponsesProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

interface ResponsesCardHeaderProps {
  chartType: ResponsesChartType;
  setChartType: (chartType: ResponsesChartType) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  dateValue: string;
  onDateValueChange: (value: string) => void;
}

interface ResponseChartProps {
  conversationResponses: ConversationUserMessageStat[];
}

export const FrontlineReportByResponses = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportByResponsesProps) => {
  const [chartType, setChartType] = useState<ResponsesChartType>(
    ResponsesChartType.Bar,
  );
  const [dateValue, setDateValue] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [filters, setFilters] = useState(() => getFilters());
  const id = title.toLowerCase().replace(/\s+/g, '-');

  const { conversationResponses, loading, error } = useConversationResponses({
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
        description="Message response statistics by user"
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>
              {error.message || 'Failed to load conversation responses'}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!conversationResponses || conversationResponses.length === 0) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description="No conversation responses found."
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
      description="Message response statistics by user"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <ResponsesCardHeader
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
            <ResponseBarChart conversationResponses={conversationResponses} />
          )}
          {chartType === ResponsesChartType.Line && (
            <ResponseLineChart conversationResponses={conversationResponses} />
          )}
          {chartType === ResponsesChartType.Pie && (
            <ResponsePieChart conversationResponses={conversationResponses} />
          )}
          {chartType === ResponsesChartType.Donut && (
            <ResponseDonutChart conversationResponses={conversationResponses} />
          )}
          {chartType === ResponsesChartType.Radar && (
            <ResponseRadarChart conversationResponses={conversationResponses} />
          )}
          {chartType === ResponsesChartType.Table && (
            <ResponseRecordTableChart
              conversationResponses={conversationResponses}
            />
          )}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

export const ResponsesCardHeader = ({
  chartType,
  setChartType,
  sourceFilter,
  onSourceFilterChange,
  dateValue,
  onDateValueChange,
}: ResponsesCardHeaderProps) => {
  return (
    <>
      <GroupSelect value={sourceFilter} onValueChange={onSourceFilterChange} />
      <DateSelector value={dateValue} onValueChange={onDateValueChange} />
      <SelectChartType value={chartType} onValueChange={setChartType} />
    </>
  );
};

export const ResponseBarChart = memo(function ResponseBarChart({
  conversationResponses,
}: ResponseChartProps) {
  const chartConfig = useMemo(
    () => ({
      messageCount: {
        label: 'Message Count',
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
    if (!conversationResponses || conversationResponses.length === 0) {
      return [];
    }
    const totalCount = conversationResponses.reduce(
      (sum, item) => sum + (item.messageCount || 0),
      0,
    );
    return conversationResponses.map((item) => {
      const messageCount = item.messageCount || 0;
      const percentage = totalCount > 0 ? (messageCount / totalCount) * 100 : 0;
      return {
        user: item.user?.details?.fullName || 'Unknown',
        messageCount,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  }, [conversationResponses]);

  const maxMessageCount = useMemo(() => {
    if (chartData.length === 0) {
      return 0;
    }
    return Math.max(...chartData.map((item) => item.messageCount || 0), 0);
  }, [chartData]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map((item) => item.percentage || 0), 100);
  }, [chartData]);

  const messageCountYAxisDomain = useMemo(() => {
    if (maxMessageCount === 0) {
      return [0, 100];
    }
    const max = Math.ceil(maxMessageCount / 50) * 50;
    return [0, max];
  }, [maxMessageCount]);

  const percentageYAxisDomain = useMemo(() => {
    const max = Math.ceil(maxPercentage / 10) * 10;
    return [0, max];
  }, [maxPercentage]);

  const scaledChartData = useMemo(() => {
    if (chartData.length === 0) return [];
    const scaleFactor =
      maxMessageCount > 0 && maxPercentage > 0
        ? maxMessageCount / maxPercentage
        : 1;
    return chartData.map((item) => {
      const messageCount = item.messageCount || 0;
      const percentage = item.percentage || 0;
      const percentageScaled = Number.isFinite(percentage * scaleFactor)
        ? percentage * scaleFactor
        : 0;
      return {
        ...item,
        messageCount,
        percentage,
        percentageScaled,
      };
    });
  }, [chartData, maxMessageCount, maxPercentage]);

  const stackedYAxisDomain = useMemo(() => {
    if (scaledChartData.length === 0) return [0, 100];
    const stackedValues = scaledChartData.map(
      (item) => (item.messageCount || 0) + (item.percentageScaled || 0),
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
        <XAxis dataKey="user" tickLine={false} axisLine={false} />
        <YAxis
          domain={stackedYAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Message Count', angle: -90, position: 'insideLeft' }}
        />
        <Bar
          dataKey="messageCount"
          fill="var(--primary)"
          stackId="stack-responses"
          name="Message Count"
        />
        <Bar
          dataKey="percentageScaled"
          fill="var(--success)"
          stackId="stack-responses"
          name="Percentage"
        />
        <Legend />
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            if (name === 'Percentage') {
              return [props.payload.percentage?.toFixed(1) + '%', 'Percentage'];
            }
            return [value, name === 'Message Count' ? 'Message Count' : name];
          }}
        />
      </BarChart>
    </ChartContainer>
  );
});

export const ResponseLineChart = memo(function ResponseLineChart({
  conversationResponses,
}: ResponseChartProps) {
  const chartConfig = useMemo(
    () => ({
      messageCount: {
        label: 'Message Count',
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
    if (!conversationResponses || conversationResponses.length === 0) {
      return [];
    }
    const totalCount = conversationResponses.reduce(
      (sum, item) => sum + (item.messageCount || 0),
      0,
    );
    return conversationResponses.map((item) => {
      const messageCount = item.messageCount || 0;
      const percentage = totalCount > 0 ? (messageCount / totalCount) * 100 : 0;
      return {
        user: item.user?.details?.fullName || 'Unknown',
        messageCount,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  }, [conversationResponses]);

  const maxMessageCount = useMemo(() => {
    if (chartData.length === 0) {
      return 0;
    }
    return Math.max(...chartData.map((item) => item.messageCount || 0), 0);
  }, [chartData]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map((item) => item.percentage || 0), 100);
  }, [chartData]);

  const messageCountYAxisDomain = useMemo(() => {
    if (maxMessageCount === 0) {
      return [0, 100];
    }
    const max = Math.ceil(maxMessageCount / 50) * 50;
    return [0, max];
  }, [maxMessageCount]);

  const percentageYAxisDomain = useMemo(() => {
    const max = Math.ceil(maxPercentage / 10) * 10;
    return [0, max];
  }, [maxPercentage]);

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <AreaChart data={chartData} margin={{ top: 10 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="user" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="messageCount"
          domain={messageCountYAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Message Count', angle: -90, position: 'insideLeft' }}
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
          yAxisId="messageCount"
          dataKey="messageCount"
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

export const ResponsePieChart = memo(function ResponsePieChart({
  conversationResponses,
}: ResponseChartProps) {
  const chartConfig = useMemo(
    () => ({
      messageCount: {
        label: 'Message Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );
  const chartData = useMemo(() => {
    if (!conversationResponses || conversationResponses.length === 0) {
      return [];
    }
    const totalCount = conversationResponses.reduce(
      (sum, item) => sum + (item.messageCount || 0),
      0,
    );
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
    return conversationResponses.map((item, index) => {
      const messageCount = item.messageCount || 0;
      const percentage = totalCount > 0 ? (messageCount / totalCount) * 100 : 0;
      return {
        user: item.user?.details?.fullName || 'Unknown',
        messageCount,
        percentage: Math.round(percentage * 100) / 100,
        fill: colors[index % colors.length],
      };
    });
  }, [conversationResponses]);
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="messageCount"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={0}
          label={({ user, messageCount, percentage }) =>
            `${user}: ${messageCount} (${percentage.toFixed(1)}%)`
          }
          nameKey="user"
        />
        {chartData?.map((item) => (
          <Cell key={item.user} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
});

export const ResponseDonutChart = memo(function ResponseDonutChart({
  conversationResponses,
}: ResponseChartProps) {
  const chartConfig = useMemo(
    () => ({
      messageCount: {
        label: 'Message Count',
        color: 'var(--primary)',
      },
    }),
    [],
  );
  const chartData = useMemo(() => {
    if (!conversationResponses || conversationResponses.length === 0) {
      return [];
    }
    const totalCount = conversationResponses.reduce(
      (sum, item) => sum + (item.messageCount || 0),
      0,
    );
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
    return conversationResponses.map((item, index) => {
      const messageCount = item.messageCount || 0;
      const percentage = totalCount > 0 ? (messageCount / totalCount) * 100 : 0;
      return {
        user: item.user?.details?.fullName || 'Unknown',
        messageCount,
        percentage: Math.round(percentage * 100) / 100,
        fill: colors[index % colors.length],
      };
    });
  }, [conversationResponses]);
  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="messageCount"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          label={({ user, messageCount, percentage }) =>
            `${user}: ${messageCount} (${percentage.toFixed(1)}%)`
          }
          nameKey="user"
        />
        {chartData?.map((item) => (
          <Cell key={item.user} fill={item.fill} />
        ))}
        <Legend />
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
});

export const ResponseRadarChart = memo(function ResponseRadarChart({
  conversationResponses,
}: ResponseChartProps) {
  const chartConfig = useMemo(
    () => ({
      messageCount: {
        label: 'Message Count',
        color: 'var(--primary)',
      },
      percentage: {
        label: 'Percentage',
        color: 'var(--success)',
      },
    }),
    [],
  );

  const maxMessageCount = useMemo(() => {
    if (!conversationResponses || conversationResponses.length === 0)
      return 100;
    const max = Math.max(
      ...conversationResponses.map((item) => item.messageCount || 0),
      0,
    );
    return Math.ceil(max / 10) * 10 || 100;
  }, [conversationResponses]);

  const chartData = useMemo(() => {
    if (!conversationResponses || conversationResponses.length === 0) {
      return [];
    }
    const totalCount = conversationResponses.reduce(
      (sum, item) => sum + (item.messageCount || 0),
      0,
    );
    const maxPercentage = 100;
    const scaleFactor =
      maxMessageCount > 0 && maxPercentage > 0
        ? maxMessageCount / maxPercentage
        : 1;
    return conversationResponses.map((item) => {
      const messageCount = item.messageCount || 0;
      const percentage = totalCount > 0 ? (messageCount / totalCount) * 100 : 0;
      return {
        user: item.user?.details?.fullName || 'Unknown',
        messageCount,
        percentage: percentage * scaleFactor,
        percentageOriginal: Math.round(percentage * 100) / 100,
      };
    });
  }, [conversationResponses, maxMessageCount]);

  const domainMax = useMemo(() => {
    return maxMessageCount;
  }, [maxMessageCount]);

  return (
    <ChartContainer config={chartConfig} className="aspect-video w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="user"
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
          name="Message Count"
          dataKey="messageCount"
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

export const ResponseRecordTableChart = memo(function ResponseRecordTableChart({
  conversationResponses,
}: ResponseChartProps) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        columns={responseRecordTableColumns}
        data={conversationResponses}
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

export const responseRecordTableColumns: ColumnDef<ConversationUserMessageStat>[] =
  [
    {
      header: 'User',
      accessorKey: 'user',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="text-xs">
          <MembersInline members={[cell.getValue() as IUser]} />
        </RecordTableInlineCell>
      ),
    },
    {
      header: 'Message Count',
      accessorKey: 'messageCount',
      size: 50,
      cell: ({ cell }) => (
        <RecordTableInlineCell className="px-4 text-xs flex items-center justify-end text-muted-foreground">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
  ];

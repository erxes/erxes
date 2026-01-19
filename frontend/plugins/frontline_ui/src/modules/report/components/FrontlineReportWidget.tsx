import {
  Alert,
  Badge,
  Button,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
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
  type LegendPayload,
} from 'recharts';
import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { ResponsesChartType } from '../types';
import { CustomLegendContent } from './chart/legend';
import { useAtom } from 'jotai';
import {
  getReportChartTypeAtom,
  getReportDateFilterAtom,
  getReportSourceFilterAtom,
  getReportChannelFilterAtom,
  getReportMemberFilterAtom,
} from '../states';
import { FilterPopover } from './filter-popover/FilterPopover';
import { REPORT_CONFIG } from '../reportConfig';
import { useConversationResolvedByDate } from '../hooks/useConversationResolvedByDate';
import { useConversationReportByDate } from '../hooks/useConversationReportByDate';
import { useConversationSources } from '../hooks/useConversationSource';
import { useConversationTags } from '../hooks/useConversationTags';
import { useConversationResponses } from '../hooks/useConversationResponses';
import { useConversationList } from '../hooks/useConversationList';
import { ConversationListItem } from '../types';
import { formatDate } from 'date-fns';
import { CustomersInline, MembersInline } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import { IconMessageShare } from '@tabler/icons-react';

type ReportType = keyof typeof REPORT_CONFIG;

interface FrontlineReportWidgetProps {
  reportType: ReportType;
  title: string;
  description?: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

interface ChartData {
  name?: string;
  tag?: string;
  date?: string;
  count: number;
  fill?: string;
}

interface GenericChartProps {
  data: ChartData[];
}

const CHART_CONFIG = {
  count: {
    label: 'Count',
    color: 'var(--primary)',
  },
} as const;

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
] as const;

const getDataKey = (data: ChartData[]) => {
  if (data.length === 0) return 'name';
  return data[0].tag ? 'tag' : data[0].date ? 'date' : 'name';
};

const calculateYAxisDomain = (maxCount: number) => {
  if (maxCount === 0) return [0, 100];
  return [0, Math.ceil(maxCount / 50) * 50];
};

const GenericBarChart = memo(function GenericBarChart({
  data,
}: GenericChartProps) {

  const maxCount = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item) => item.count || 0), 0);
  }, [data]);

  const yAxisDomain = useMemo(
    () => calculateYAxisDomain(maxCount),
    [maxCount],
  );

  if (data.length === 0) return null;

  const dataKey = getDataKey(data);
  const isDateData = !!data[0].date;

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-video w-full">
      <BarChart
        data={data}
        margin={isDateData ? { top: 10, right: 10, left: 10, bottom: 60 } : {}}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={dataKey}
          tickLine={false}
          axisLine={false}
          {...(isDateData && {
            angle: -45,
            textAnchor: 'end',
            height: 60,
          })}
        />
        <YAxis
          domain={yAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Bar
          dataKey="count"
          fill="var(--primary)"
          name="Count"
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

const GenericLineChart = memo(function GenericLineChart({
  data,
}: GenericChartProps) {

  const maxCount = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item) => item.count || 0), 0);
  }, [data]);

  const yAxisDomain = useMemo(
    () => calculateYAxisDomain(maxCount),
    [maxCount],
  );

  if (data.length === 0) return null;

  const dataKey = getDataKey(data);
  const isDateData = !!data[0].date;

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-video w-full">
      <AreaChart
        data={data}
        margin={
          isDateData
            ? { top: 10, right: 10, left: 10, bottom: 60 }
            : { top: 10 }
        }
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={dataKey}
          tickLine={false}
          axisLine={false}
          {...(isDateData && {
            angle: -45,
            textAnchor: 'end',
            height: 60,
          })}
        />
        <YAxis
          domain={yAxisDomain}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
        />
        <Area
          dataKey="count"
          type="monotone"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
          strokeWidth={2}
          strokeLinecap="round"
          name="Count"
          dot={{ fill: 'var(--primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  );
});

const GenericPieChart = memo(function GenericPieChart({
  data,
}: GenericChartProps) {
  const [hoveredItem, setHoveredItem] = useState<string | undefined>(undefined);

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const nameKey = getDataKey(data);
    return data.map((item, index) => ({
      count: item.count || 0,
      name: item[nameKey as keyof typeof item] as string,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-video w-full">
      <PieChart data={chartData}>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="name"
        >
          {chartData?.map((item, index) => (
            <Cell
              key={`cell-${index}`}
              fill={item.fill}
              opacity={hoveredItem && hoveredItem !== item.name ? 0.5 : 1}
            />
          ))}
        </Pie>
        <Legend
          content={(props: any) => (
            <CustomLegendContent
              {...props}
              onMouseEnter={(data: LegendPayload) => {
                const name = data.value as string;
                if (name) setHoveredItem(name);
              }}
              onMouseLeave={() => setHoveredItem(undefined)}
            />
          )}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

const GenericRadarChart = memo(function GenericRadarChart({
  data,
}: GenericChartProps) {

  const maxCount = useMemo(() => {
    if (data.length === 0) return 100;
    const max = Math.max(...data.map((item) => item.count || 0), 0);
    return Math.ceil(max / 10) * 10 || 100;
  }, [data]);

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const nameKey = getDataKey(data);
    return data.map((item) => ({
      name: item[nameKey as keyof typeof item] as string,
      count: item.count || 0,
    }));
  }, [data]);

  const domainMax = useMemo(() => Math.max(maxCount, 100), [maxCount]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-video w-full">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="name"
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
        <Legend content={(props: any) => <CustomLegendContent {...props} />} />
        <Tooltip content={<ChartTooltipContent />} />
      </RadarChart>
    </ChartContainer>
  );
});

const GenericTableChart = memo(function GenericTableChart({
  data,
  isListType = false,
}: GenericChartProps & { isListType?: boolean }) {
  const navigate = useNavigate();

  const listColumns: ColumnDef<ConversationListItem>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ cell }) => {
          return (
            <RecordTableInlineCell>
              <span className="text-xs text-muted-foreground">
                {formatDate(cell.getValue() as string, 'dd/MM/yyyy HH:mm')}
              </span>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'customerId',
        header: 'Customer',
        accessorKey: 'customerId',
        cell: ({ cell }) => {
          return (
            <RecordTableInlineCell>
              <CustomersInline.Provider
                customerIds={[cell.getValue() as string]}
              >
                <CustomersInline.Avatar size="sm" />
                <CustomersInline.Title className="text-xs text-muted-foreground" />
              </CustomersInline.Provider>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'userId',
        header: 'Last Conversation by',
        accessorKey: 'userId',
        size: 100,
        cell: ({ cell }) => {
          const { userId } = cell.row.original || {};
          if (!userId) {
            return (
              <RecordTableInlineCell className="flex items-center justify-center">
                <Badge variant="secondary" className="text-xs">
                  Customer
                </Badge>
              </RecordTableInlineCell>
            );
          }
          return (
            <RecordTableInlineCell className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                Member
              </Badge>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 100,
        cell: ({ cell }) => {
          return (
            <RecordTableInlineCell className="flex items-center justify-center">
              <Badge>{cell.getValue() as string}</Badge>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'assignedUserId',
        header: 'Assigned to',
        accessorKey: 'assignedUserId',
        cell: ({ cell }) => {
          return (
            <RecordTableInlineCell>
              <MembersInline.Provider memberIds={[cell.getValue() as string]}>
                <MembersInline.Avatar size="sm" />
                <MembersInline.Title className="text-xs text-muted-foreground" />
              </MembersInline.Provider>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'readUsers',
        header: 'Opened by',
        accessorKey: 'readUsers',
        cell: ({ cell }) => {
          const { readUsers } = cell.row.original || {};
          if (!readUsers) {
            return <RecordTableInlineCell>N/A</RecordTableInlineCell>;
          }
          return (
            <RecordTableInlineCell>
              <MembersInline.Provider
                memberIds={readUsers.map((user: any) => user._id)}
              >
                <MembersInline.Avatar size="sm" />
                <MembersInline.Title className="text-xs text-muted-foreground" />
              </MembersInline.Provider>
            </RecordTableInlineCell>
          );
        },
      },
      {
        id: 'open',
        size: 33,
        cell: ({ cell }) => {
          const { _id } = cell.row.original || {};
          return (
            <RecordTable.MoreButton
              className="w-full h-full"
              onClick={() => {
                navigate(`/frontline/inbox?conversationId=${_id}`);
              }}
            >
              <IconMessageShare />
            </RecordTable.MoreButton>
          );
        },
      },
    ],
    [navigate],
  );

  const nameKey = useMemo(() => {
    if (isListType || data.length === 0) return 'name';
    return getDataKey(data);
  }, [data, isListType]);

  const chartColumns: ColumnDef<ChartData>[] = useMemo(
    () => [
      {
        id: nameKey,
        header:
          nameKey === 'date' ? 'Date' : nameKey === 'tag' ? 'Tag' : 'Name',
        accessorKey: nameKey,
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
          const { count } = cell.row.original || {};
          return (
            <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
              {count}
            </RecordTableInlineCell>
          );
        },
      },
    ],
    [nameKey],
  );

  const columns = isListType ? listColumns : chartColumns;

  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
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
      {isListType && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="w-auto"
            onClick={() => {
              navigate('/frontline/inbox');
            }}
          >
            Go to conversations
          </Button>
        </div>
      )}
    </div>
  );
});

export const FrontlineReportWidget = ({
  reportType,
  title,
  description,
  colSpan = 6,
  onColSpanChange,
}: FrontlineReportWidgetProps) => {
  const config = REPORT_CONFIG[reportType];
  if (!config) {
    return null;
  }

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
  const initializedRef = useRef(false);

  useEffect(() => {
    const newFilters = getFilters(dateValue || undefined);
    setFilters(newFilters);
  }, [dateValue]);

  useEffect(() => {
    if (!initializedRef.current && config.defaultChartType) {
      const defaultType = config.defaultChartType as ResponsesChartType;
      if (
        chartType === ResponsesChartType.Bar &&
        defaultType !== ResponsesChartType.Bar
      ) {
        setChartType(defaultType);
      }
      initializedRef.current = true;
    }
  }, [chartType, config.defaultChartType, setChartType]);

  const handleDateValueChange = (value: string) => {
    setDateValue(value);
  };

  const hookOptions = useMemo(
    () => ({
      variables: {
        filters: {
          ...filters,
          channelIds: channelFilter.length ? channelFilter : undefined,
          memberIds: memberFilter.length ? memberFilter : undefined,
          source: sourceFilter !== 'all' ? sourceFilter : undefined,
        },
      },
    }),
    [filters, channelFilter, memberFilter, sourceFilter],
  );

  let hookResult: any = { loading: true, error: null };
  let data: any = null;

  switch (reportType) {
    case 'openDates':
      hookResult = useConversationReportByDate(hookOptions);
      data = hookResult.reports?.reportConversationOpenDate || [];
      break;
    case 'resolvedDates':
      hookResult = useConversationResolvedByDate(hookOptions);
      data = hookResult.reports?.reportConversationResolvedDate || [];
      break;
    case 'sources':
      hookResult = useConversationSources(hookOptions);
      data = hookResult.conversationSources || [];
      break;
    case 'tags':
      hookResult = useConversationTags(hookOptions);
      data = hookResult.conversationTags || [];
      break;
    case 'responses':
      hookResult = useConversationResponses(hookOptions);
      data = hookResult.conversationResponses || [];
      break;
    case 'list':
      hookResult = useConversationList(hookOptions);
      data = hookResult.conversationList?.list || [];
      break;
  }

  const { loading, error } = hookResult;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (reportType === 'list') return data;

    return data.map((item: any) => {
      switch (reportType) {
        case 'openDates':
        case 'resolvedDates':
          return {
            date: item.date || 'Unknown',
            count: item.count || 0,
          };
        case 'tags':
          return {
            tag: item.name || 'Unknown',
            count: item.count || 0,
          };
        case 'sources':
          return {
            name: item.name || 'Unknown',
            count: item.count || 0,
          };
        case 'responses':
          return {
            name: item.user?.details?.fullName || 'Unknown',
            count: item.messageCount || 0,
          };
        default:
          return {
            name: item._id || 'Unknown',
            count: 0,
          };
      }
    });
  }, [data, reportType]);

  if (loading) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={description || 'Loading report data'}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header
          filter={
            <>
              <FilterPopover
                id={id}
                sourceFilter={sourceFilter}
                onSourceFilterChange={setSourceFilter}
                dateValue={dateValue}
                onDateValueChange={handleDateValueChange}
                channelFilter={channelFilter}
                onChannelFilterChange={setChannelFilter}
                memberFilter={memberFilter}
                onMemberFilterChange={setMemberFilter}
              />
              {!config.tableOnly && (
                <SelectChartType
                  value={chartType}
                  onValueChange={setChartType}
                />
              )}
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
        description={description || 'Report data'}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>Error loading data</Alert.Title>
            <Alert.Description>
              {error.message || 'Failed to load report data'}
            </Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return <FrontlineCard.Empty />;
    }

    if (config.tableOnly || chartType === ResponsesChartType.Table) {
      return (
        <GenericTableChart
          data={chartData}
          isListType={reportType === 'list'}
        />
      );
    }

    const chartComponents = {
      [ResponsesChartType.Bar]: GenericBarChart,
      [ResponsesChartType.Line]: GenericLineChart,
      [ResponsesChartType.Pie]: GenericPieChart,
      [ResponsesChartType.Radar]: GenericRadarChart,
    };

    const ChartComponent =
      chartComponents[chartType] || chartComponents[ResponsesChartType.Bar];

    return <ChartComponent data={chartData} />;
  };

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={description || 'Report data'}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header
        filter={
          <>
            <FilterPopover
              id={id}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              dateValue={dateValue}
              onDateValueChange={handleDateValueChange}
              channelFilter={channelFilter}
              onChannelFilterChange={setChannelFilter}
              memberFilter={memberFilter}
              onMemberFilterChange={setMemberFilter}
            />
            {!config.tableOnly && (
              <SelectChartType value={chartType} onValueChange={setChartType} />
            )}
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
          {renderChart()}
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

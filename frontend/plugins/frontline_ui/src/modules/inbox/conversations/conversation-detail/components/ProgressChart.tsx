import { ChartContainer } from 'erxes-ui';
import { CartesianGrid, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { useConversationProgressChart } from '@/inbox/conversations/conversation-detail/hooks/useConversationProgressChart';
import { format, parseISO, endOfDay, subDays, isAfter } from 'date-fns';

interface IProgressChartProps {
  customerId: string;
}

export const ProgressChart = ({ customerId }: IProgressChartProps) => {
  const { conversationProgressChart } = useConversationProgressChart({
    variables: { customerId },
  });

  const rawData = conversationProgressChart?.chartData || [];
  const totalScopeValue = conversationProgressChart?.total || 0;

  const statusColors = {
    new: 'var(--gray)',
    open: 'var(--warning)',
    closed: 'var(--primary)',
    resolved: 'var(--success)',
  };

  const chartConfig = {
    new: { label: 'New', color: statusColors.new },
    open: { label: 'Open', color: statusColors.open },
    closed: { label: 'Closed', color: statusColors.closed },
    resolved: { label: 'Resolved', color: statusColors.resolved },
  };

  const todayEnd = endOfDay(new Date());
  const yesterdayEnd = endOfDay(subDays(new Date(), 1));

  const chartData = rawData.map((item) => {
    if (isAfter(parseISO(item.date), todayEnd)) {
      return {
        ...item,
        totalScope: totalScopeValue,
        new: item.new ?? 0,
        open: item.open ?? 0,
        closed: item.closed ?? 0,
        resolved: item.resolved ?? 0,
      };
    }
    return { ...item, totalScope: totalScopeValue };
  });

  chartData.unshift({
    date: yesterdayEnd.toISOString(),
    totalScope: totalScopeValue,
    new: 0,
    open: 0,
    closed: 0,
    resolved: 0,
  });

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(parseISO(value), 'MMM d')}
        />
        <YAxis domain={[0, totalScopeValue]} hide allowDecimals={false} />

        <Area
          dataKey="new"
          type="monotone"
          stroke={statusColors.new}
          fill={statusColors.new}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
          connectNulls
          strokeLinecap="round"
        />
        <Area
          dataKey="open"
          type="monotone"
          stroke={statusColors.open}
          fill={statusColors.open}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
          connectNulls
          strokeLinecap="round"
        />
        <Area
          dataKey="closed"
          type="monotone"
          stroke={statusColors.closed}
          fill={statusColors.closed}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
          connectNulls
          strokeLinecap="round"
        />
        <Area
          dataKey="resolved"
          type="monotone"
          stroke={statusColors.resolved}
          fill={statusColors.resolved}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
          connectNulls
          strokeLinecap="round"
        />
      </AreaChart>
    </ChartContainer>
  );
};

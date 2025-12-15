import { ChartContainer } from 'erxes-ui';
import { CartesianGrid, XAxis, AreaChart, Area, YAxis } from 'recharts';
import { format, parseISO, endOfDay, isAfter, subDays } from 'date-fns';

export const ProgressChart = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const statusColors = {
    total: 'var(--primary)', // in progress
    open: 'var(--warning)', // done
    close: 'var(--success)', // backlog буюу жишээ өнгө
  };

  const chartConfig = {
    total: {
      label: 'Total',
      color: statusColors.total,
    },
    open: {
      label: 'Open',
      color: statusColors.open,
    },
    close: {
      label: 'Close',
      color: statusColors.close,
    },
  };
  return (
    <div>
      <ChartContainer config={chartConfig} className="w-full aspect-video">
        <AreaChart accessibilityLayer data={[]} margin={{ top: 10 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(parseISO(value), 'MMM d')}
          />
          <YAxis domain={[0, 100]} hide={true} allowDecimals={false} />
          <Area
            dataKey="total"
            type="monotone"
            stroke={statusColors.total}
            fill={statusColors.total}
            fillOpacity={0.2}
            strokeWidth={2}
            connectNulls={true}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
          />
          <Area
            dataKey="open"
            type="monotone"
            stroke={statusColors.open}
            fill={statusColors.open}
            fillOpacity={0.2}
            strokeWidth={2}
            connectNulls={true}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
          />
          <Area
            dataKey="close"
            type="monotone"
            stroke={statusColors.close}
            fill={statusColors.close}
            fillOpacity={0.2}
            strokeWidth={2}
            connectNulls={true}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

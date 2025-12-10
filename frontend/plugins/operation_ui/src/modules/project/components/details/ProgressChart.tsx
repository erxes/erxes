import { ChartContainer } from 'erxes-ui';
import { CartesianGrid, XAxis, AreaChart, Area, YAxis } from 'recharts';
import { useGetProjectProgressChart } from '@/project/hooks/useGetProjectProgressChart';
import { format, parseISO, endOfDay, isAfter, subDays } from 'date-fns';

export const ProgressChart = ({ projectId }: { projectId: string }) => {
  const statusColors = {
    started: 'var(--warning)', // in progress
    completed: 'var(--success)', // done
    totalScope: 'var(--primary)', // backlog буюу жишээ өнгө
  };

  const chartConfig = {
    started: {
      label: 'Started',
      color: statusColors.started,
    },
    completed: {
      label: 'Completed',
      color: statusColors.completed,
    },
  };

  const { getProjectProgressChart } = useGetProjectProgressChart({
    variables: { _id: projectId },
  });

  const rawData = getProjectProgressChart?.chartData || [];
  const totalScopeValue = getProjectProgressChart?.totalScope || 0;

  const todayEnd = endOfDay(new Date());
  const yesterdayEnd = endOfDay(subDays(new Date(), 1));

  const chartData = rawData.map((item) => {
    if (isAfter(parseISO(item.date), todayEnd)) {
      return {
        ...item,
        totalScope: totalScopeValue,
        started: null,
        completed: null,
      };
    }
    return { ...item, totalScope: totalScopeValue };
  });

  chartData.unshift({
    date: yesterdayEnd.toISOString(),
    totalScope: totalScopeValue,
    started: 0,
    completed: 0,
  });

  return (
    <div>
      <ChartContainer config={chartConfig}>
        <AreaChart accessibilityLayer data={chartData} margin={{ top: 10 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(parseISO(value), 'MMM d')}
          />
          <YAxis
            domain={[0, totalScopeValue]}
            hide={true}
            allowDecimals={false}
          />
          <Area
            dataKey="totalScope"
            type="monotone"
            stroke={statusColors.totalScope}
            fill={statusColors.totalScope}
            fillOpacity={0.2}
            strokeWidth={2}
            connectNulls={true}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
          />
          <Area
            dataKey="started"
            type="monotone"
            stroke={statusColors.started}
            fill={statusColors.started}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            strokeLinecap="round"
          />
          <Area
            dataKey="completed"
            type="monotone"
            stroke={statusColors.completed}
            fill={statusColors.completed}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            strokeLinecap="round"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

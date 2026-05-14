import { ChartContainer } from 'erxes-ui';
import { CartesianGrid, XAxis, AreaChart, Area, YAxis } from 'recharts';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import { useMemo } from 'react';
import { ITask } from '@/task/types';

interface TasksProgressChartProps {
  tasks: ITask[];
}

export const TasksProgressChart = ({ tasks }: TasksProgressChartProps) => {
  const statusColors = {
    started: 'var(--warning)',
    completed: 'var(--success)',
    totalScope: 'var(--primary)',
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

  const chartData = useMemo(() => {
    if (tasks.length === 0) return [];

    const today = startOfDay(new Date());
    const dates: Date[] = [];
    for (let i = 13; i >= 0; i--) {
      dates.push(subDays(today, i));
    }

    const totalScope = tasks.length;

    return dates.map((date) => {
      let completed = 0;
      let started = 0;

      tasks.forEach((task) => {
        const createdAt = task.createdAt ? parseISO(task.createdAt) : null;
        
        if (!createdAt || createdAt > date) return;

        if (task.status === 'done') {
          completed++;
        } else if (task.status !== 'backlog') {
          started++;
        }
      });

      return {
        date: date.toISOString(),
        totalScope,
        started,
        completed,
      };
    });
  }, [tasks]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const totalScopeValue = tasks.length;

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
            domain={[0, totalScopeValue || 1]}
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

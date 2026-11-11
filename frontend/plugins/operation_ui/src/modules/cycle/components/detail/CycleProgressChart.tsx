import { ICycleStatistics } from '@/cycle/types';
import { CHART_CONFIG, STATUS_COLORS } from '@/cycle/constants';
import { useGetCycleProgressChart } from '@/cycle/hooks/useGetCycleProgressChart';

import { endOfDay, format, isAfter, parseISO, subDays } from 'date-fns';
import { ChartContainer } from 'erxes-ui';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { TProgressChartData } from '@/project/components/details/ProgressChart';

// Future days are drawn faded; gradient ids are per chart, so several charts
// on one page (the home dashboard) don't paint each other's lines.
export const CycleProgressChartView = ({
  progress,
}: {
  progress?: TProgressChartData | null;
}) => {
  const gradientId = useId().replace(/:/g, '');
  const rawData = progress?.chartData || [];
  const totalScopeValue = progress?.totalScope || 0;
  const todayEnd = endOfDay(new Date());
  const yesterdayEnd = endOfDay(subDays(new Date(), 1));

  const chartData = rawData.map((item, index) => {
    if (isAfter(parseISO(item.date), todayEnd)) {
      const { started, completed } =
        index > 0 ? rawData[index - 1] : { started: 0, completed: 0 };

      return {
        ...item,
        totalScope: totalScopeValue,
        started,
        completed,
        startedOpacity: 0.4,
        completedOpacity: 0.4,
        startedFillOpacity: 0.05,
        completedFillOpacity: 0.05,
        future: true,
      };
    }
    return {
      ...item,
      totalScope: totalScopeValue,
      startedOpacity: 1,
      completedOpacity: 1,
      startedFillOpacity: 0.2,
      completedFillOpacity: 0.2,
      future: false,
    };
  });

  chartData.unshift({
    date: yesterdayEnd.toISOString(),
    totalScope: totalScopeValue,
    started: 0,
    completed: 0,
    startedOpacity: 1,
    completedOpacity: 1,
    startedFillOpacity: 0.2,
    completedFillOpacity: 0.2,
    future: false,
  });

  return (
    <div>
      <ChartContainer config={CHART_CONFIG}>
        <AreaChart accessibilityLayer data={chartData} margin={{ top: 10 }}>
          <ProgressChartGradients data={chartData} idPrefix={gradientId} />
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
            stroke={STATUS_COLORS.totalScope}
            fill={STATUS_COLORS.totalScope}
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
            stroke={`url(#${gradientId}startedGradient)`}
            fill={`url(#${gradientId}startedFillGradient)`}
            strokeWidth={2}
            dot={false}
            connectNulls={true}
            strokeLinecap="round"
            activeDot={{ fill: STATUS_COLORS.started, r: 4 }}
          />
          <Area
            dataKey="completed"
            type="monotone"
            stroke={`url(#${gradientId}completedGradient)`}
            fill={`url(#${gradientId}completedFillGradient)`}
            strokeWidth={2}
            dot={false}
            connectNulls={true}
            strokeLinecap="round"
            activeDot={{ fill: STATUS_COLORS.completed, r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export const CycleProgressChart = ({
  cycleId,
  isCompleted,
  statistics,
}: {
  cycleId: string;
  isCompleted: boolean;
  statistics?: ICycleStatistics;
}) => {
  const { getCycleProgressChart } = useGetCycleProgressChart(
    isCompleted ? undefined : cycleId,
  );

  return (
    <CycleProgressChartView
      progress={getCycleProgressChart || statistics?.chartData}
    />
  );
};

export const ProgressChartGradients = ({
  data = [],
  idPrefix = '',
}: {
  data: { date: string; started: number; completed: number; future: boolean }[];
  idPrefix?: string;
}) => {
  const lines: ('started' | 'completed')[] = ['started', 'completed'];

  return (
    <defs>
      {lines.map((line) => (
        <linearGradient
          key={line}
          id={`${idPrefix}${line}Gradient`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          {data.map((item, index) => {
            const denom = Math.max(data.length - 1, 1);
            const percent = (index / denom) * 100;
            const opacity = item.future ? 0.4 : 1;
            return (
              <stop
                key={index}
                offset={`${percent}%`}
                stopColor={STATUS_COLORS[line]}
                stopOpacity={opacity}
              />
            );
          })}
        </linearGradient>
      ))}

      {lines.map((line) => (
        <linearGradient
          key={`${line}Fill`}
          id={`${idPrefix}${line}FillGradient`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          {data.map((item, index) => {
            const denom = Math.max(data.length - 1, 1);
            const percent = (index / denom) * 100;
            const opacity = item.future ? 0.5 : 0.2;
            return (
              <stop
                key={index}
                offset={`${percent}%`}
                stopColor={STATUS_COLORS[line]}
                stopOpacity={opacity}
              />
            );
          })}
        </linearGradient>
      ))}
    </defs>
  );
};

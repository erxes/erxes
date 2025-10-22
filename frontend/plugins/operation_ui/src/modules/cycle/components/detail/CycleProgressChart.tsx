import { CHART_CONFIG, STATUS_COLORS } from '@/cycle/constants';
import {
  IGetCycleProgressChart,
  useGetCycleProgressChart,
} from '@/cycle/hooks/useGetCycleProgressChart';
import { endOfDay, format, isAfter, parseISO, subDays } from 'date-fns';
import { ChartContainer } from 'erxes-ui';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export const CycleProgressChart = ({
  cycleId,
  isCompleted,
  statistics,
}: {
  cycleId: string;
  isCompleted: boolean;
  statistics: any;
}) => {
  const { getCycleProgressChart } = useGetCycleProgressChart({
    variables: { _id: cycleId },
    skip: !cycleId || isCompleted,
  });

  const progress =
    getCycleProgressChart || (statistics.chartData as IGetCycleProgressChart);

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
          <ProgressChartGradients data={chartData} />
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
            fill={`hsla(var(--primary) / 0.2)`}
            strokeWidth={2}
            connectNulls={true}
            strokeLinecap="round"
            dot={false}
            activeDot={false}
          />
          <Area
            dataKey="started"
            type="monotone"
            stroke="url(#startedGradient)"
            fill="url(#startedFillGradient)"
            strokeWidth={2}
            dot={false}
            connectNulls={true}
            strokeLinecap="round"
            activeDot={{ fill: STATUS_COLORS.started, r: 4 }}
          />
          <Area
            dataKey="completed"
            type="monotone"
            stroke="url(#completedGradient)"
            fill="url(#completedFillGradient)"
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

export const ProgressChartGradients = ({
  data = [],
}: {
  data: { date: string; started: number; completed: number; future: boolean }[];
}) => {
  const lines: ('started' | 'completed')[] = ['started', 'completed'];

  return (
    <defs>
      {lines.map((line) => (
        <linearGradient id={`${line}Gradient`} x1="0" y1="0" x2="1" y2="0">
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
        <linearGradient id={`${line}FillGradient`} x1="0" y1="0" x2="1" y2="0">
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

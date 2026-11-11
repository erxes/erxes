import dayjs from 'dayjs';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { IActivityDay } from '../types';

export const ActivityDailyChart = ({ days }: { days: IActivityDay[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const config = useMemo(
    () => ({ hours: { label: t('active-hours'), color: 'var(--primary)' } }),
    [t],
  );
  const series = useMemo(
    () =>
      days.map((day) => ({
        date: day.date,
        hours: Math.round((day.minutes / 60) * 10) / 10,
      })),
    [days],
  );

  return (
    <ChartContainer config={config} className="h-48 w-full">
      <BarChart data={series} margin={{ top: 8, right: 8, left: -24 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(date: string) => dayjs(date).format('MMM D')}
          minTickGap={16}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(date: string) =>
                dayjs(date).format('ddd, MMM D')
              }
            />
          }
        />
        <Bar
          dataKey="hours"
          fill="var(--primary)"
          name={t('active-hours')}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
};

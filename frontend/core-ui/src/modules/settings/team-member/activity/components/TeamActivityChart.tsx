import dayjs from 'dayjs';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IUserActivityDay } from '../types';

export const TeamActivityChart = ({
  series,
}: {
  series: IUserActivityDay[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const config = useMemo(
    () => ({
      hours: { label: t('team-active-hours'), color: 'var(--primary)' },
      activeMembers: {
        label: t('active-members'),
        color: 'var(--success)',
      },
    }),
    [t],
  );
  const data = useMemo(
    () =>
      series.map((day) => ({
        date: day.date,
        hours: Math.round((day.minutes / 60) * 10) / 10,
        activeMembers: day.activeMembers,
      })),
    [series],
  );

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-xs bg-primary" />
          {t('team-active-hours')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full bg-success" />
          {t('active-members')}
        </span>
      </div>
      <ChartContainer config={config} className="mt-2 h-64 w-full">
        <ComposedChart data={data} margin={{ top: 8, right: 0, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(date: string) => dayjs(date).format('MMM D')}
            minTickGap={16}
          />
          <YAxis
            yAxisId="hours"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="members"
            orientation="right"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
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
            yAxisId="hours"
            dataKey="hours"
            fill="var(--primary)"
            name={t('team-active-hours')}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="members"
            dataKey="activeMembers"
            stroke="var(--success)"
            strokeWidth={2}
            dot={false}
            type="monotone"
            name={t('active-members')}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

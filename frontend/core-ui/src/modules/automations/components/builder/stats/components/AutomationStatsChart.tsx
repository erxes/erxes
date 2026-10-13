import { TAutomationStatsBucket } from '@/automations/types';
import dayjs from 'dayjs';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

// Status colours follow STATUSES_BADGE_VARIABLES so the chart and the badges
// tell the same story.
const CHART_CONFIG = {
  complete: { label: 'Complete', color: 'var(--success)' },
  error: { label: 'Error', color: 'var(--destructive)' },
  waiting: { label: 'Waiting', color: 'var(--warning)' },
};

const EMPTY_BUCKET = { total: 0, complete: 0, error: 0, waiting: 0 };

const useFilledSeries = (
  timeSeries: TAutomationStatsBucket[],
  beginDate: Date,
  endDate: Date,
) =>
  useMemo(() => {
    const byDate = new Map(timeSeries.map((bucket) => [bucket.date, bucket]));
    const filled: TAutomationStatsBucket[] = [];
    const last = dayjs(endDate).startOf('day');

    for (
      let day = dayjs(beginDate).startOf('day');
      !day.isAfter(last);
      day = day.add(1, 'day')
    ) {
      const date = day.format('YYYY-MM-DD');
      filled.push(byDate.get(date) ?? { date, ...EMPTY_BUCKET });
    }

    return filled;
  }, [timeSeries, beginDate, endDate]);

export const AutomationStatsChart = ({
  timeSeries,
  beginDate,
  endDate,
}: {
  timeSeries: TAutomationStatsBucket[];
  beginDate: Date;
  endDate: Date;
}) => {
  const { t } = useTranslation('automations');
  const series = useFilledSeries(timeSeries, beginDate, endDate);

  if (!timeSeries.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border bg-background text-sm text-muted-foreground">
        {t('stats-no-runs-in-range')}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <span className="text-xs font-medium text-muted-foreground">
        {t('stats-runs-per-day')}
      </span>
      <ChartContainer config={CHART_CONFIG} className="mt-2 h-72 w-full">
        <BarChart data={series} margin={{ top: 8, right: 8, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(date: string) => dayjs(date).format('MMM D')}
            minTickGap={16}
          />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="complete"
            stackId="runs"
            fill="var(--success)"
            name={t('stats-complete')}
          />
          <Bar
            dataKey="waiting"
            stackId="runs"
            fill="var(--warning)"
            name={t('stats-waiting')}
          />
          <Bar
            dataKey="error"
            stackId="runs"
            fill="var(--destructive)"
            name={t('error')}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

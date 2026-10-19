import { TAutomationStatsActivity } from '@/automations/components/builder/stats/hooks/useAutomationStatsActivity';
import { formatStatsDuration } from '@/automations/components/builder/stats/utils/automationStatsFormat';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

const CHART_CONFIG = {
  p50Ms: { label: 'P50', color: 'var(--primary)' },
  p95Ms: { label: 'P95', color: 'var(--muted-foreground)' },
};

export const AutomationStatsLatency = ({
  latency,
  formatBucket,
}: Pick<TAutomationStatsActivity, 'latency' | 'formatBucket'>) => {
  const { t } = useTranslation('automations');

  if (!latency.some(({ count }) => count > 0)) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {t('stats-no-latency')}
      </div>
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="h-56 w-full">
      <BarChart
        data={latency}
        barGap={2}
        margin={{ top: 8, right: 8, left: -8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="start"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatBucket}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(ms: number) => formatStatsDuration(ms)}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, [item]) =>
                item?.payload ? formatBucket(item.payload.start) : ''
              }
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-4">
                  <span>{name === 'p50Ms' ? 'P50' : 'P95'}</span>
                  <span className="font-mono">
                    {formatStatsDuration(Number(value))}
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar dataKey="p50Ms" fill="var(--primary)" radius={[2, 2, 0, 0]} />
        <Bar
          dataKey="p95Ms"
          fill="var(--muted-foreground)"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
};

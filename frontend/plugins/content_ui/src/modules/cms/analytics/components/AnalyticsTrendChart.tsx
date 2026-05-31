import { Card, ChartContainer, ChartTooltip, ChartTooltipContent } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { CmsAnalyticsTimeSeriesPoint } from '../types';
import { formatAnalyticsDate } from '../utils/formatAnalytics';

type AnalyticsTrendChartProps = {
  data: CmsAnalyticsTimeSeriesPoint[];
};

export const AnalyticsTrendChart = ({ data }: AnalyticsTrendChartProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });

  const chartConfig = useMemo(
    () => ({
      activeUsers: {
        label: t('metrics.active-users'),
        color: 'var(--primary)',
      },
      sessions: {
        label: t('metrics.sessions'),
        color: 'var(--success)',
      },
      screenPageViews: {
        label: t('metrics.views'),
        color: 'var(--info)',
      },
    }),
    [t],
  );

  return (
    <Card className="rounded-lg border shadow-none">
      <Card.Header className="p-4 pb-0">
        <Card.Title className="text-base">{t('trend-title')}</Card.Title>
        <Card.Description>{t('trend-description')}</Card.Description>
      </Card.Header>
      <Card.Content className="p-4">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 4, right: 12, top: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={formatAnalyticsDate}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis axisLine={false} tickLine={false} width={44} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="screenPageViews"
              fill="var(--info)"
              fillOpacity={0.12}
              name={t('metrics.views')}
              stroke="var(--info)"
              strokeLinecap="round"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="sessions"
              fill="var(--success)"
              fillOpacity={0.12}
              name={t('metrics.sessions')}
              stroke="var(--success)"
              strokeLinecap="round"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="activeUsers"
              fill="var(--primary)"
              fillOpacity={0.16}
              name={t('metrics.active-users')}
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
};

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from 'erxes-ui/components/charts';
import { useIsClient } from '../hooks/useIsClient';
import type { ChartVizPayload } from '../types/chatVizTypes';
import {
  formatChartVizAxisValue,
  getChartVizTrendDomain,
  getDefaultChartVizColor,
} from '../utils/chartVizPresentation';

interface Props {
  payload: ChartVizPayload;
  className?: string;
  /** Frozen axis domain for interactive charts; falls back to a padded fit. */
  domain?: [number, number];
}

export function ChatVizArea({ payload, className, domain }: Props) {
  const isClient = useIsClient();

  const config = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        payload.series.map((s, i) => [
          s.key,
          { label: s.label, color: s.color ?? getDefaultChartVizColor(i) },
        ]),
      ),
    [payload.series],
  );

  if (!isClient) return <ChartSkeleton />;

  return (
    <ChartContainer config={config} className={className}>
      <AreaChart
        data={payload.data}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          type="number"
          domain={domain ?? getChartVizTrendDomain}
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          tickFormatter={formatChartVizAxisValue}
          width={52}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          content={(props) => (
            <ChartLegendContent
              payload={props.payload ?? []}
              verticalAlign={props.verticalAlign}
            />
          )}
        />
        {payload.series.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            fill={`var(--color-${s.key})`}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

function ChartSkeleton() {
  return (
    <div
      className="animate-pulse rounded-md bg-muted"
      style={{ width: '100%', aspectRatio: '16/9' }}
      aria-hidden
    />
  );
}

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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

interface Props {
  payload: ChartVizPayload;
  className?: string;
}

export function ChatVizArea({ payload, className }: Props) {
  const isClient = useIsClient();

  const config = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        payload.series.map((s, i) => [
          s.key,
          { label: s.label, color: s.color ?? `hsl(var(--chart-${i + 1}))` },
        ]),
      ),
    [payload.series],
  );

  if (!isClient) return <ChartSkeleton />;

  return (
    <ChartContainer config={config} className={className}>
      <AreaChart data={payload.data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
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

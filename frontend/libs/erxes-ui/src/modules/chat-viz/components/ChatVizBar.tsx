import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  getDefaultChartVizColor,
} from '../utils/chartVizPresentation';

interface Props {
  payload: ChartVizPayload;
  className?: string;
  /** Frozen zero-based axis domain for interactive charts. */
  domain?: [number, number];
}

export function ChatVizBar({ payload, className, domain }: Props) {
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

  // Recharts uses window/document — defer until client-side to prevent SSR errors.
  if (!isClient) return <ChartSkeleton />;

  return (
    <ChartContainer config={config} className={className}>
      <BarChart
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
          domain={domain}
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
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={`var(--color-${s.key})`}
            radius={4}
          />
        ))}
      </BarChart>
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

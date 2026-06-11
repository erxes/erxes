import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';

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

/**
 * Pie chart variant.
 *
 * For pie charts, each data row is a slice. The first series key is used as the
 * value field; `label` is used as the slice name. Additional series are ignored.
 */
export function ChatVizPie({ payload, className }: Props) {
  const isClient = useIsClient();

  const valueKey = payload.series[0]?.key ?? 'value';

  const config = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        payload.data.map((d, i) => [
          d.label,
          {
            label: d.label,
            color:
              payload.series[0]?.color ?? `hsl(var(--chart-${(i % 5) + 1}))`,
          },
        ]),
      ),
    [payload.data, payload.series],
  );

  if (!isClient) return <ChartSkeleton />;

  return (
    <ChartContainer config={config} className={className}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
        <Pie
          data={payload.data}
          dataKey={valueKey}
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          strokeWidth={2}
        >
          {payload.data.map((_, i) => (
            <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
          ))}
        </Pie>
        <ChartLegend
          content={(props) => (
            <ChartLegendContent
              payload={props.payload ?? []}
              verticalAlign={props.verticalAlign}
              nameKey="label"
            />
          )}
        />
      </PieChart>
    </ChartContainer>
  );
}

function ChartSkeleton() {
  return (
    <div
      className="animate-pulse rounded-md bg-muted"
      style={{ width: '100%', aspectRatio: '1/1', maxWidth: 300 }}
      aria-hidden
    />
  );
}

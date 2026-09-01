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
import { getDefaultChartVizColor } from '../utils/chartVizPresentation';

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
export function ChatVizPie({ payload, className }: Readonly<Props>) {
  const isClient = useIsClient();

  const valueKey = payload.series[0]?.key ?? 'value';

  const config = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        payload.data.map((d) => [
          d.label,
          {
            // Labels are untrusted text, so they must never become CSS custom
            // property names in ChartStyle. Slice colors are applied directly
            // to the sanitized Recharts Cell below.
            label: d.label,
          },
        ]),
      ),
    [payload.data],
  );
  const cells = React.useMemo(() => {
    const occurrences = new Map<string, number>();
    const seriesColor = payload.series[0]?.color;

    return payload.data.map((point, paletteIndex) => {
      const identity = JSON.stringify([point.label, point[valueKey]]);
      const occurrence = occurrences.get(identity) ?? 0;
      occurrences.set(identity, occurrence + 1);

      return {
        key: JSON.stringify([identity, occurrence]),
        fill: seriesColor ?? getDefaultChartVizColor(paletteIndex),
      };
    });
  }, [payload.data, payload.series, valueKey]);

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
          {cells.map((cell) => (
            <Cell key={cell.key} fill={cell.fill} />
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

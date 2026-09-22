import * as React from 'react';
import { Area, AreaChart } from 'recharts';

import { ChartContainer, type ChartConfig } from 'erxes-ui/components/charts';
import { useIsClient } from '../hooks/useIsClient';
import type { ChartVizPayload } from '../types/chatVizTypes';
import {
  getChartVizTrendDomain,
  getDefaultChartVizColor,
} from '../utils/chartVizPresentation';
import { ChatVizCartesianDecorations } from './ChatVizCartesianDecorations';

interface Props {
  payload: ChartVizPayload;
  className?: string;
  /** Frozen axis domain for interactive charts; falls back to a padded fit. */
  domain?: [number, number];
}

export function ChatVizArea({ payload, className, domain }: Readonly<Props>) {
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
        <ChatVizCartesianDecorations
          domain={domain ?? getChartVizTrendDomain}
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

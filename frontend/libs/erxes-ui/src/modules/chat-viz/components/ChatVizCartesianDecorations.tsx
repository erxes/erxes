import * as React from 'react';
import { CartesianGrid, XAxis, YAxis, type YAxisProps } from 'recharts';

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from 'erxes-ui/components/charts';
import { formatChartVizAxisValue } from '../utils/chartVizPresentation';

interface Props {
  domain?: YAxisProps['domain'];
}

/** Shared axes, grid, tooltip, and legend for cartesian chat charts. */
export function ChatVizCartesianDecorations({ domain }: Readonly<Props>) {
  return (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
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
    </>
  );
}

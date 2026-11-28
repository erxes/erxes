import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from 'erxes-ui';
import type * as Recharts from 'recharts';

type Charts = typeof Recharts;

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

const colorAt = (index: number) => COLORS[index % COLORS.length] ?? 'var(--chart-1)';

interface Series {
  name: string;
  values: number[];
}

export interface ChartPlotProps {
  kind: string;
  labels: string[];
  series: Series[];
}

interface PlotProps extends ChartPlotProps {
  charts: Charts;
}

const keyOf = (index: number) => `series${index}`;

const rowsOf = (labels: string[], series: Series[]) =>
  labels.map((label, at) => ({
    label,
    ...Object.fromEntries(series.map(({ values }, index) => [keyOf(index), values[at] ?? 0])),
  }));

const configOf = (series: Series[]): ChartConfig =>
  Object.fromEntries(
    series.map(({ name }, index) => [keyOf(index), { label: name, color: colorAt(index) }]),
  );

const Axes = ({ charts }: { charts: Charts }) => (
  <>
    <charts.CartesianGrid vertical={false} />
    <charts.XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} />
    <charts.YAxis tickLine={false} axisLine={false} width={44} />
    <charts.Tooltip content={<ChartTooltipContent />} />
  </>
);

const Slices = ({ charts, labels, series }: PlotProps) => {
  const [first] = series;

  const slices = labels.map((label, at) => ({
    label,
    value: first?.values[at] ?? 0,
    fill: colorAt(at),
  }));

  return (
    <charts.PieChart responsive>
      <charts.Tooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
      <charts.Pie data={slices} dataKey="value" nameKey="label" innerRadius="45%" />
      <charts.Legend />
    </charts.PieChart>
  );
};

const Plot = ({ charts, kind, labels, series }: PlotProps) => {
  const rows = rowsOf(labels, series);
  const legend = series.length > 1 && <charts.Legend content={<ChartLegendContent />} />;

  if (kind === 'pie') return <Slices charts={charts} kind={kind} labels={labels} series={series} />;

  if (kind === 'line') {
    return (
      <charts.LineChart responsive data={rows}>
        <Axes charts={charts} />
        {legend}
        {series.map((item, index) => (
          <charts.Line
            key={item.name}
            dataKey={keyOf(index)}
            stroke={colorAt(index)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </charts.LineChart>
    );
  }

  if (kind === 'area') {
    return (
      <charts.AreaChart responsive data={rows}>
        <Axes charts={charts} />
        {legend}
        {series.map((item, index) => (
          <charts.Area
            key={item.name}
            dataKey={keyOf(index)}
            stroke={colorAt(index)}
            fill={colorAt(index)}
            fillOpacity={0.2}
          />
        ))}
      </charts.AreaChart>
    );
  }

  return (
    <charts.BarChart responsive data={rows}>
      <Axes charts={charts} />
      {legend}
      {series.map((item, index) => (
        <charts.Bar key={item.name} dataKey={keyOf(index)} fill={colorAt(index)} radius={3} />
      ))}
    </charts.BarChart>
  );
};

export const chartPlotWith = (charts: Charts) => {
  const ChartPlot = (props: ChartPlotProps) => (
    <ChartContainer config={configOf(props.series)} className="aspect-auto h-52 w-full">
      <Plot charts={charts} {...props} />
    </ChartContainer>
  );

  return ChartPlot;
};

import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Spinner from 'modules/common/components/Spinner';
import { EmptyWrapper } from 'modules/boards/styles/viewtype';
import EmptyState from 'modules/common/components/EmptyState';

const CartesianChart = ({ resultSet, children, ChartComponent, height }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot}>
      <XAxis axisLine={false} tickLine={false} dataKey="x" minTickGap={20} />
      <YAxis axisLine={false} tickLine={false} />
      <CartesianGrid vertical={false} />
      {children}
      <Legend />
      <Tooltip />
    </ChartComponent>
  </ResponsiveContainer>
);

const TypeToChartComponent = {
  bar: ({ resultSet, height }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        ChartComponent={BarChart}
      >
        {resultSet.seriesNames.map((series, i) => (
          <Bar
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={decamelize(series.title, ' ')}
            fill={chartColors[i]}
          />
        ))}
      </CartesianChart>
    );
  }
};

const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map(key => ({
    [key]: React.memo(TypeToChartComponent[key])
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const renderChart = Component => ({
  result,
  dateType,
  height,
  measureType
}) => {
  return (
    (result && (
      <Component
        height={height}
        resultSet={result}
        dateType={dateType}
        measureType={measureType}
      />
    )) || <Spinner objective={true} />
  );
};

type Props = {
  query?: any;
  chartType?: any;
  chartHeight?: any;
};

export default function ChartRenderer(props: Props) {
  const [result, setResult] = useState<any>({ result: {} });

  const { query, chartType, chartHeight } = props;

  const prevAmount = {} as any;

  setResult(prevAmount);

  const component = TypeToMemoChartComponent[chartType];

  let dateType = '';

  if (result.seriesNames) {
    const { timeDimensions, measures } = query;

    const measureType = measures[0];

    if (timeDimensions[0]) {
      dateType = timeDimensions[0].granularity;
    }

    return renderChart(component)({
      height: chartHeight,
      result,
      dateType,
      measureType
    });
  }

  if (result === 'No data') {
    return (
      <EmptyWrapper>
        <EmptyState text="no Data" />
      </EmptyWrapper>
    );
  }

  return <Spinner objective={true} />;
}

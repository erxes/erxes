import { useCubeQuery } from '@cubejs-client/react';
import dayjs from 'dayjs';
import numeral from 'numeral';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { chartColors } from '../../constants';

type Props = {
  query?: any;
  chartType?: any;
  chartHeight?: any;
};

const nFormatter = num => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;

  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(1).replace(rx, '$1') + si[i].symbol;
};

const dateFormatter = (item, dateType) => {
  switch (dateType) {
    case 'hours':
      return dayjs(item).format('HH');
    case 'day':
      return dayjs(item).format('MMM/DD');
    case 'month':
      return dayjs(item).format('YYYY/MMM');
    case 'year':
      return dayjs(item).format('YYYY');
    case 'week':
      return dayjs(item).format('MMM/DD');
    default:
      return dayjs(item).format('YYYY');
  }
};

const xAxisFormatter = (item, dateType) => {
  if (dateType) {
    return dateFormatter(item, dateType);
  } else {
    return item.toString();
  }
};

const CartesianChart = ({
  resultSet,
  children,
  ChartComponent,
  height,
  dateType
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot()}>
      <XAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={item => xAxisFormatter(item, dateType)}
        dataKey="x"
        minTickGap={20}
      />
      <YAxis axisLine={false} tickLine={false} tickFormatter={nFormatter} />
      <CartesianGrid vertical={false} />
      {children}
      <Legend />
      <Tooltip
        labelFormatter={item => xAxisFormatter(item, dateType)}
        formatter={nFormatter}
      />
    </ChartComponent>
  </ResponsiveContainer>
);

const TypeToChartComponent = {
  line: ({ resultSet, height, dateType }) => (
    <CartesianChart
      resultSet={resultSet}
      height={height}
      ChartComponent={LineChart}
      dateType={dateType}
    >
      {resultSet.seriesNames().map((series, i) => (
        <Line
          key={series.key}
          dataKey={series.key}
          name={series.title}
          stroke={chartColors[i]}
        />
      ))}
    </CartesianChart>
  ),
  bar: ({ resultSet, height, dateType }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        ChartComponent={BarChart}
        dateType={dateType}
      >
        {resultSet.seriesNames().map((series, i) => (
          <Bar
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            fill={chartColors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  area: ({ resultSet, height, dateType }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        dateType={dateType}
        ChartComponent={AreaChart}
      >
        {resultSet.seriesNames().map((series, i) => (
          <Area
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            stroke={chartColors[i]}
            fill={chartColors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  pie: ({ resultSet, height }) => {
    if (resultSet.seriesNames()[0]) {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={resultSet.chartPivot()}
              nameKey="x"
              dataKey={resultSet.seriesNames()[0].key}
              fill="#8884d8"
            >
              {resultSet.chartPivot().map((e, index) => (
                <Cell
                  key={index}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return <></>;
  }
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map(key => ({
    [key]: React.memo(TypeToChartComponent[key])
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const renderChart = Component => ({ resultSet, dateType, error, height }) => {
  return (
    (resultSet && (
      <Component height={height} resultSet={resultSet} dateType={dateType} />
    )) ||
    (error && error.toString()) || <Spinner />
  );
};

const ChartRenderer = (props: Props) => {
  const { query, chartType, chartHeight } = props;
  const component = TypeToMemoChartComponent[chartType];
  const renderProps = useCubeQuery(query);
  let dateType = '';

  if (renderProps.resultSet) {
    const { timeDimensions } = query;

    if (timeDimensions[0]) {
      dateType = timeDimensions[0].granularity;
    }
    return renderChart(component)({
      height: chartHeight,
      ...renderProps,
      dateType
    });
  }

  return <Spinner />;
};

export default ChartRenderer;

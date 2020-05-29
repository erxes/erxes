import { useCubeQuery } from '@cubejs-client/react';
import { Col, Row, Spin, Statistic, Table } from 'antd';
import React from 'react';
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
  YAxis,
} from 'recharts';

import styled from 'styled-components';

import dayjs from 'dayjs';
import numeral from 'numeral';
import './recharts-theme.less';

const numberFormatter = (item) => numeral(item).format('0,0');

const colors = [
  '#7DB3FF',
  '#49457B',
  '#FF7C78',
  '#32a852',
  '#7c2bba',
  '#d1a924',
  '#05f238',
];

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
  dateType,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot()}>
      <XAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={(item) => xAxisFormatter(item, dateType)}
        dataKey="x"
        minTickGap={20}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={numberFormatter}
      />
      <CartesianGrid vertical={false} />
      {children}
      <Legend />
      <Tooltip
        labelFormatter={(item) => xAxisFormatter(item, dateType)}
        formatter={numberFormatter}
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
          stroke={colors[i]}
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
            fill={colors[i]}
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
            stroke={colors[i]}
            fill={colors[i]}
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
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return <></>;
  },
  table: ({ resultSet }) => {
    return (
      <Table
        columns={resultSet
          .tableColumns()
          .map((c) => ({ ...c, dataIndex: c.key }))}
        dataSource={resultSet.tablePivot().map((result, index) => ({
          ...result,
          key: `${index}+${result.value}`,
        }))}
      />
    );
  },

  number: ({ resultSet }) => (
    <Row
      justify="center"
      align="middle"
      style={{
        height: '100%',
      }}
    >
      <Col>
        {resultSet.seriesNames().map((s) => (
          <Statistic key={s.key} value={resultSet.totalRow()[s.key]} />
        ))}
      </Col>
    </Row>
  ),
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map((key) => ({
    [key]: React.memo(TypeToChartComponent[key]),
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const SpinContainer = styled.div`
  text-align: center;
  padding: 30px 50px;
  margin-top: 30px;
`;
const Spinner = () => (
  <SpinContainer>
    <Spin size="large" />
  </SpinContainer>
);

const renderChart = (Component) => ({ resultSet, dateType, error, height }) => {
  return (
    (resultSet && (
      <Component height={height} resultSet={resultSet} dateType={dateType} />
    )) ||
    (error && error.toString()) || <Spinner />
  );
};

const ChartRenderer = ({
  vizState,
  chartHeight = 300,
}: {
  vizState?: any;
  chartHeight?: any;
}) => {
  const { query, chartType } = vizState;
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
      dateType,
    });
  }

  return <Spinner />;
};

export default ChartRenderer;

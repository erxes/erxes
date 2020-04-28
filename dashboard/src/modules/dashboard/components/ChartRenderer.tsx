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
  YAxis
} from 'recharts';
import styled from 'styled-components';

import dayjs from 'dayjs';
import numeral from 'numeral';
import './recharts-theme.less';

const numberFormatter = item => numeral(item).format('0,0');
const dateFormatter = item => dayjs(item).format('MMM');

const colors = ['#7DB3FF', '#49457B', '#FF7C78'];
const xAxisFormatter = item => {
  if (dayjs(item).isValid()) {
    return dateFormatter(item);
  } else {
    return numberFormatter(item);
  }
};

const CartesianChart = ({ resultSet, children, ChartComponent, height }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot()}>
      <XAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={xAxisFormatter}
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
      <Tooltip labelFormatter={dateFormatter} formatter={numberFormatter} />
    </ChartComponent>
  </ResponsiveContainer>
);

const TypeToChartComponent = {
  line: ({ resultSet, height }) => (
    <CartesianChart
      resultSet={resultSet}
      height={height}
      ChartComponent={LineChart}
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
  bar: ({ resultSet, height }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        ChartComponent={BarChart}
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
  area: ({ resultSet, height }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
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
  pie: ({ resultSet, height }) => (
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
  ),
  table: ({ resultSet }) => (
    <Table
      pagination={false}
      columns={resultSet.tableColumns().map(c => ({ ...c, dataIndex: c.key }))}
      dataSource={resultSet.tablePivot()}
    />
  ),
  number: ({ resultSet }) => (
    <Row
      justify="center"
      align="middle"
      style={{
        height: '100%'
      }}
    >
      <Col>
        {resultSet.seriesNames().map(s => (
          <Statistic key={s.key} value={resultSet.totalRow()[s.key]} />
        ))}
      </Col>
    </Row>
  )
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map(key => ({
    [key]: React.memo(TypeToChartComponent[key])
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

const renderChart = Component => ({ resultSet, error, height }) =>
  (resultSet && <Component height={height} resultSet={resultSet} />) ||
  (error && error.toString()) || <Spinner />;

const ChartRenderer = ({
  vizState,
  chartHeight = 300
}: {
  vizState?: any;
  chartHeight?: any;
}) => {
  const { query, chartType } = vizState;
  const component = TypeToMemoChartComponent[chartType];
  const renderProps = useCubeQuery(query);

  console.log(renderProps);

  return renderChart(component)({ height: chartHeight, ...renderProps });
};

export default ChartRenderer;

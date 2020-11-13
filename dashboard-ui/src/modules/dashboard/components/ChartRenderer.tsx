import { Col, Row, Statistic, Table } from 'antd';
import { getEnv } from 'apolloClient';
import axios from 'axios';
import dayjs from 'dayjs';
import Spinner from 'modules/common/components/Spinner';
import numeral from 'numeral';

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
import { chartColors, replaceTexts } from '../constants';

const { REACT_APP_DASHBOARD_API_URL } = getEnv();

const numberFormatter = item => numeral(item).format('0,0');

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

function decamelize(str, separator) {
  separator = typeof separator === 'undefined' ? ' ' : separator;

  const replace = replaceTexts.find(value => {
    return value.name === str;
  });

  if (replace) {
    return replace.value;
  }

  str = str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .replace('-', ' ');

  return str.toLowerCase();
}

const xAxisFormatter = (item, dateType) => {
  if (dateType) {
    return dateFormatter(item, dateType);
  } else {
    return decamelize(item.toString(), ' ');
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
    <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot}>
      <XAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={item => xAxisFormatter(item, dateType)}
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
        labelFormatter={item => xAxisFormatter(item, dateType)}
        formatter={numberFormatter}
      />
    </ChartComponent>
  </ResponsiveContainer>
);

const TypeToChartComponent = {
  line: ({ resultSet, height, dateType }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        ChartComponent={LineChart}
        dateType={dateType}
      >
        {resultSet.seriesNames.map((series, i) => (
          <Line
            key={series.key}
            dataKey={series.key}
            name={decamelize(series.title, ' ')}
            stroke={chartColors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  bar: ({ resultSet, height, dateType }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        ChartComponent={BarChart}
        dateType={dateType}
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
  },
  area: ({ resultSet, height, dateType }) => {
    return (
      <CartesianChart
        resultSet={resultSet}
        height={height}
        dateType={dateType}
        ChartComponent={AreaChart}
      >
        {resultSet.seriesNames.map((series, i) => (
          <Area
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={decamelize(series.title, ' ')}
            stroke={chartColors[i]}
            fill={chartColors[i]}
          />
        ))}
      </CartesianChart>
    );
  },
  pie: ({ resultSet, height }) => {
    if (resultSet.seriesNames[0]) {
      const renderData = result => {
        for (const res of result) {
          if (typeof res.x === 'string') {
            res.x = decamelize(res.x, ' ');
          }
        }

        return result;
      };

      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={renderData(resultSet.chartPivot)}
              nameKey="x"
              dataKey={resultSet.seriesNames[0].key}
              fill="#8884d8"
            >
              {resultSet.chartPivot.map((e, index) => (
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
  },

  table: ({ resultSet }) => {
    const columns = resultSet.tableColumns;
    const renderResult = result => {
      for (const [key, value] of Object.entries(result)) {
        if (typeof value === 'number') {
          result[key] = result[key]
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        if (typeof value === 'string') {
          result[key] = decamelize(result[key], ' ');
        }
      }

      return result;
    };

    return (
      <Table
        bordered={true}
        size="middle"
        columns={columns.map(c => ({ ...c, dataIndex: c.key }))}
        dataSource={resultSet.tablePivot.map((result, index) => ({
          ...renderResult(result),
          key: `${index}+${result.value}`
        }))}
      />
    );
  },

  number: ({ resultSet }) => (
    <Row
      justify="center"
      align="middle"
      style={{
        height: '100%'
      }}
    >
      <Col>
        {resultSet.seriesNames.map(s => (
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

const renderChart = Component => ({ result, dateType, height }) => {
  return (
    (result && (
      <Component height={height} resultSet={result} dateType={dateType} />
    )) || <Spinner objective={true} />
  );
};

type Props = {
  query?: any;
  chartType?: any;
  chartHeight?: any;
};

type State = {
  result;
};

export class ChartRenderer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      result: {}
    };
  }

  componentDidMount() {
    this.setState({ result: {} }, () => {
      this.getDatas();
    });
  }

  componentWillReceiveProps() {
    this.setState({ result: {} }, () => {
      this.getDatas();
    });
  }

  getDatas = () => {
    const { query } = this.props;

    const apiUrl = new URL('/get', REACT_APP_DASHBOARD_API_URL);

    axios
      .get(`${apiUrl}`, {
        params: query
      })
      .then(response => this.setState({ result: response.data }));
  };

  render() {
    const { result } = this.state;
    const { query, chartType, chartHeight } = this.props;

    const component = TypeToMemoChartComponent[chartType];

    let dateType = '';

    if (result.seriesNames) {
      const { timeDimensions } = query;

      if (timeDimensions[0]) {
        dateType = timeDimensions[0].granularity;
      }
      return renderChart(component)({
        height: chartHeight,
        result,
        dateType
      });
    }

    return <Spinner objective={true} />;
  }
}

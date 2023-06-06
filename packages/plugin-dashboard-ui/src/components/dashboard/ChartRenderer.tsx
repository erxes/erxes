import { useCubeQuery } from '@cubejs-client/react';
import dayjs from 'dayjs';
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
  XAxis
} from 'recharts';
import { chartColors } from '../../constants';
import Table from '@erxes/ui/src/components/table';
import { ChartTable, EmptyContent, Number } from '../../styles';
import { __ } from '@erxes/ui/src/utils';
import numeral from 'numeral';

type Props = {
  query?: any;
  chartType?: any;
  chartHeight?: any;
  filters?: any;
  validatedQuery?: any;
};

const msConversion = millis => {
  let sec = Math.floor(millis / 1000) as any;
  const hrs = Math.floor(sec / 3600) as any;
  sec -= hrs * 3600;
  let min = Math.floor(sec / 60) as any;
  sec -= min * 60;

  sec = '' + sec;
  sec = ('00' + sec).substring(sec.length);

  if (hrs > 0) {
    min = '' + min;
    min = ('00' + min).substring(min.length);
    return `${hrs}h:${min}m:${sec}s`;
  } else {
    return `${min}m:${sec}s`;
  }
};

const numberFormatter = (item, measureType) => {
  if (measureType === 'Conversations Average response time') {
    return msConversion(item);
  }

  if (measureType === 'Conversations Average close time') {
    return msConversion(item);
  }

  return numeral(item).format('0,0');
};

const dateFormatter = (item, dateType) => {
  switch (dateType) {
    case 'hour':
      return dayjs(item).format('HH:mm');
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

const decamelize = (str, separator) => {
  separator = typeof separator === 'undefined' ? ' ' : separator;

  str = str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .replace('-', ' ');

  return str.toLowerCase();
};

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
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent margin={{ left: -10 }} data={resultSet.chartPivot()}>
        <XAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={item => xAxisFormatter(item, dateType)}
          dataKey="x"
          minTickGap={20}
        />

        <CartesianGrid vertical={false} />
        {children}
        <Legend />
        <Tooltip
          labelFormatter={item => xAxisFormatter(item, dateType)}
          formatter={(item, key) => numberFormatter(item, key)}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
};

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
  },

  table: ({ resultSet }) => {
    const columns = resultSet
      .tableColumns()
      .map(tableColumns => tableColumns.title);

    const rowValues = resultSet.tablePivot();

    const renderTableValue = (value, key) => {
      if (key === 'Conversations.avgResponse') {
        return msConversion(value);
      }

      if (key === 'Conversations.avgClose') {
        return msConversion(value);
      }

      if (typeof value === 'number') {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      if (typeof value === 'string') {
        return decamelize(value, ' ');
      }

      return value;
    };

    return (
      <ChartTable>
        <Table whiteSpace="nowrap" hover={true} responsive={true}>
          <thead>
            <tr>
              {columns.map(column => {
                return <th key={Math.random()}>{column}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {rowValues.map(rowValue => {
              return (
                <tr key={Math.random()}>
                  {/* {columns.map(column => {
                    return (
                      <td key={Math.random()}>
                        {renderTableValue(rowValue[column], column, rowValue)}
                      </td>
                    );
                  })} */}
                  {Object.keys(rowValue).map(key => {
                    return (
                      <td key={Math.random()}>
                        {renderTableValue(rowValue[key], key)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ChartTable>
    );
  },

  number: ({ resultSet }) => {
    let result = 0;

    resultSet.seriesNames().map(s => {
      result = resultSet.totalRow();

      result = result[s.key];
    });

    return <Number>{result}</Number>;
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
    (error && error.toString()) || (
      <EmptyContent>
        {' '}
        <p>
          <b> {error.toString()}</b>.
        </p>
      </EmptyContent>
    )
  );
};

const ChartRenderer = (props: Props) => {
  const { query, chartType, chartHeight, filters, validatedQuery } = props;
  const component = TypeToMemoChartComponent[chartType || 'table'];
  let finalQuery = query;

  if (filters && filters.length > 0) {
    for (const filter of filters) {
      if (!filter.operator) {
        finalQuery = validatedQuery;
      }
    }
  }

  const renderProps = useCubeQuery(finalQuery);

  const resultSet = renderProps.resultSet || ({} as any);

  let result = 0;

  let dateType = '';

  if (renderProps.resultSet) {
    const { timeDimensions, measures } = query;

    if (timeDimensions && timeDimensions[0]) {
      dateType = timeDimensions[0].granularity;
    }

    resultSet.seriesNames().map(s => {
      result = resultSet.totalRow();

      result = result[s.key];
    });

    if (result === 0) {
      return (
        <EmptyContent>
          <p>
            <b>{__('No data')}</b>
          </p>
        </EmptyContent>
      );
    }

    return renderChart(component)({
      height: chartHeight,
      ...renderProps,
      dateType
    });
  }

  return (
    <EmptyContent>
      <Spinner />
    </EmptyContent>
  );
};

export default ChartRenderer;

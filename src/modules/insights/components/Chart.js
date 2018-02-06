import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Spinner } from 'modules/common/components';
import { ChartWrapper, LoaderWrapper } from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number
};

class Chart extends React.Component {
  render() {
    const { data, width, height, loading } = this.props;
    const textStyle = { textTransform: 'capitalize' };

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective />
        </LoaderWrapper>
      );
    }

    return (
      <ChartWrapper>
        <AreaChart width={width} height={height} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="1 3" />
          <Tooltip
            wrapperStyle={{ borderRadius: '4px' }}
            itemStyle={textStyle}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#a174e2"
            strokeWidth={2}
            fill="#ba91f7"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartWrapper>
    );
  }
}

Chart.propTypes = propTypes;

export default Chart;

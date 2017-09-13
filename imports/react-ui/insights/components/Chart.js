import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

class Chart extends React.Component {
  render() {
    const { data, width, height } = this.props;
    const textStyle = { textTransform: 'capitalize' };
    return (
      <div className="chart-wrapper">
        <AreaChart width={width} height={height} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="1 3" />
          <Tooltip wrapperStyle={{ borderRadius: '4px' }} itemStyle={textStyle} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#a174e2"
            strokeWidth={2}
            fill="#ba91f7"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </div>
    );
  }
}

Chart.propTypes = propTypes;

export default Chart;

import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

class Chart extends React.Component {
  render() {
    const { data, width, height } = this.props;
    return (
      <LineChart width={width} height={height} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#5884d8" activeDot={{ r: 4 }} />
      </LineChart>
    );
  }
}

Chart.propTypes = propTypes;

export default Chart;

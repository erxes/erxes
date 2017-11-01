import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartWrapper, IntegrationKind, KindItem, KindCount } from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  wrapperWidth: PropTypes.number
};

class Insights extends React.Component {
  render() {
    const { data, wrapperWidth } = this.props;
    const width = (wrapperWidth || 400) * 0.5;
    const height = width * 0.5;

    const COLORS = ['#7242c3', '#1dcaff', '#3B5998', '#f0ad4e', '#ccc'];
    const classNames = ['default', 'twitter', 'facebook', 'form', 'primary'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent
    }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <ChartWrapper>
        <IntegrationKind style={{ marginLeft: width }}>
          {data.map((detail, index) => (
            <KindItem key={index}>
              <span className={`label label-${classNames[index]}`}>
                {detail.name}
              </span>
              <KindCount>{detail.value}</KindCount>
            </KindItem>
          ))}
        </IntegrationKind>

        <PieChart width={width} height={height} onMouseEnter={this.onPieEnter}>
          <Pie
            data={data}
            dataKey="value"
            cx={width * 0.5}
            cy={height * 0.5}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={height * 0.48}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartWrapper>
    );
  }
}

Insights.propTypes = propTypes;

export default Insights;

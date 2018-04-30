import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell } from 'recharts';
import { Label, Spinner } from 'modules/common/components';
import {
  ChartWrapper,
  IntegrationKind,
  KindItem,
  KindCount,
  LoaderWrapper
} from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  wrapperWidth: PropTypes.number,
  loading: PropTypes.bool
};

class Insights extends React.Component {
  render() {
    const { data, wrapperWidth, loading } = this.props;
    const width = (wrapperWidth || 400) * 0.5;
    const height = width * 0.5;

    const COLORS = ['#A389D4', '#F7CE53', '#1dcaff', '#3B5998', '#ccc'];
    const classNames = ['default', 'form', 'twitter', 'facebook', 'primary'];

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

    if (loading) {
      return (
        <LoaderWrapper>
          <Spinner objective />
        </LoaderWrapper>
      );
    }

    return (
      <ChartWrapper>
        <IntegrationKind style={{ marginLeft: width }}>
          {data.map((detail, index) => (
            <KindItem key={index}>
              <Label className={`label-${classNames[index]}`}>
                {detail.name}
              </Label>
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

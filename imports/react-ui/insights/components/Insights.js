import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { PieChart, Pie, Cell } from 'recharts';

import Sidebar from './Sidebar';
import Filter from './Filter';

const propTypes = {
  data: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
};

class Insights extends React.Component {
  render() {
    const { data, brands } = this.props;

    const circleData = [
      { name: 'Group A', value: 400 },
      { name: 'Group B', value: 300 },
      { name: 'Group C', value: 300 },
      { name: 'Group D', value: 200 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
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

    const content = (
      <div className="insight-wrapper">
        <Filter brands={brands} hideIntegration={true} />

        <div className="margined" id="insightWrapper">
          <PieChart width={800} height={400} onMouseEnter={this.onPieEnter}>
            <Pie
              data={circleData}
              dataKey="name"
              cx={300}
              cy={200}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
            >
              {circleData.map((entry, index) =>
                <Cell key={index} fill={COLORS[index % COLORS.length]} />,
              )}
            </Pie>
          </PieChart>
        </div>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Insights' }]} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

Insights.propTypes = propTypes;

export default Insights;

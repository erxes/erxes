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
  constructor(props) {
    super(props);

    this.state = {
      width: 800,
      height: 600,
    };
  }

  componentDidMount() {
    const width = this.wrapper.clientWidth;
    const height = $('.main-content').height();
    this.setState({ width, height });
  }

  render() {
    const { data, brands } = this.props;
    const width = this.state.width;
    const height = this.state.height * 0.8;

    const COLORS = ['#337ab7', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f'];
    const classNames = ['primary', 'success', 'info', 'warning', 'danger'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
      <div
        className="insight-wrapper"
        ref={node => {
          this.wrapper = node;
        }}
      >
        <div className="integration-kind col-sm-6">
          {data.map((detail, index) =>
            <span key={index} className="kind-item">
              <span className={`label label-${classNames[index]}`}>
                {detail.name}
              </span>
              <span className="kind-count">
                {detail.value}
              </span>
            </span>,
          )}
        </div>

        <Filter brands={brands} hideIntegration={true} />

        <div className="margined" id="insightWrapper">
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
              {data.map((entry, index) =>
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

import React from 'react';
import PropTypes from 'prop-types';
import D3PunchCard from 'd3-punchcard';

const propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number,
};

class PunchCard extends React.Component {
  componentDidMount() {
    this.renderPunchCard('init');
  }

  componentDidUpdate() {
    this.renderPunchCard('update');
  }

  generateData(data) {
    const chartData = [];

    data.map(detail => {
      const day = detail.day;
      const value = detail.value;

      value.map((val, index) => {
        if (val > 0) {
          chartData.push([day, index, val]);
        }
      });
    });

    return chartData;
  }

  renderPunchCard(type) {
    const { data, width } = this.props;

    let chart;
    if (type === 'init') {
      chart = D3PunchCard({ target: '#punch-card', width });
      this.chart = chart;
    } else {
      chart = this.chart;
    }

    chart.render(this.generateData(data));
  }

  render() {
    return <div id="punch-card" />;
  }
}

PunchCard.propTypes = propTypes;

export default PunchCard;

import * as React from 'react';
import PropTypes from 'prop-types';
import D3PunchCard from 'bat-d3-punchcard';
import { ChartWrapper } from '../styles';

const propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number
};

class PunchCard extends React.Component {
  componentDidMount() {
    this.renderPunchCard('init');
  }

  componentDidUpdate() {
    this.renderPunchCard('update');
  }

  renderPunchCard(type) {
    const { data, width } = this.props;

    let chart;
    const color = '#452679';
    if (type === 'init') {
      chart = D3PunchCard({ target: '#punch-card', width, color });
      this.chart = chart;
    } else {
      chart = this.chart;
    }

    chart.render(data);
  }

  render() {
    return <ChartWrapper id="punch-card" className="punch-card" />;
  }
}

PunchCard.propTypes = propTypes;

export default PunchCard;

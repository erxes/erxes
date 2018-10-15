import D3PunchCard from 'bat-d3-punchcard';
import * as React from 'react';
import { ChartWrapper } from '../styles';

type Props = {
  data: any;
  width: number;
};

class PunchCard extends React.Component<Props> {
  private chart;

  componentDidMount() {
    this.renderPunchCard('init');
  }

  componentDidUpdate() {
    this.renderPunchCard('update');
  }

  renderPunchCard(type: string) {
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

export default PunchCard;

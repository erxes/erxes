import { ScatterPlot } from '@nivo/scatterplot';
import React from 'react';

type Props = {
  growthHacks: any[];
  growthHacksPriorityMatrix: any[];
};

class Left extends React.Component<Props> {
  renderChart = () => {
    return (
      <ScatterPlot
        width={900}
        height={500}
        data={[
          {
            id: 'apples',
            data: [
              { x: '2018-01-01', y: 7 },
              { x: '2018-01-02', y: 5 },
              { x: '2018-01-03', y: 11 },
              { x: '2018-01-04', y: 9 },
              { x: '2018-01-05', y: 12 },
              { x: '2018-01-06', y: 16 },
              { x: '2018-01-07', y: 13 },
              { x: '2018-01-08', y: 13 }
            ]
          },
          {
            id: 'oranges',
            data: [
              { x: '2018-01-04', y: 14 },
              { x: '2018-01-05', y: 14 },
              { x: '2018-01-06', y: 15 },
              { x: '2018-01-07', y: 11 },
              { x: '2018-01-08', y: 10 },
              { x: '2018-01-09', y: 12 },
              { x: '2018-01-10', y: 9 },
              { x: '2018-01-11', y: 7 }
            ]
          }
        ]}
      />
    );
  };

  render() {
    const growthHacks = this.props.growthHacks.map(growthHack => (
      <span key={growthHack._id}>
        impact: {growthHack.impact} ease: {growthHack.ease} <br />
      </span>
    ));

    const growthHacksPriorityMatrix = this.props.growthHacksPriorityMatrix.map(
      growthHack => (
        <span key={growthHack._id}>
          impact: {growthHack.impact} ease: {growthHack.ease} <br />
        </span>
      )
    );

    return (
      <div>
        {this.renderChart()}
        <b>growthHacksPriorityMatrix:</b>
        <br /> {growthHacksPriorityMatrix}
        <br />
        <b>growthHacks:</b>
        <br /> {growthHacks}
      </div>
    );
  }
}

export default Left;

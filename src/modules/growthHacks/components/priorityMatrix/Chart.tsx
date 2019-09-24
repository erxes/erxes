import { __ } from 'modules/common/utils';
import { RightContent } from 'modules/growthHacks/styles';
import React from 'react';
import { AxisX, AxisY, ChartAxis, ChartLegends, Point } from './styles';

type Props = {
  datas: any[];
};

class Chart extends React.PureComponent<Props> {
  render() {
    return (
      <RightContent>
        <ChartAxis>
          {this.props.datas.map(data => (
            <Point key={Math.random()} x={data.x} y={data.y}>
              <span>{data.name}</span>
            </Point>
          ))}

          <ChartLegends>
            <span className="top-left">{__('Big Bets')}</span>
            <span className="top-right">{__('Quick Wins')}</span>
            <span className="bottom-left">{__('Time Sinks')}</span>
            <span className="bottom-right">{__('Maybes')}</span>
          </ChartLegends>

          <AxisY>{__('Impact')}</AxisY>
          <AxisX>{__('Effort')}</AxisX>
        </ChartAxis>
      </RightContent>
    );
  }
}

export default Chart;

import { __ } from 'modules/common/utils';
import { RightContent } from 'modules/growthHacks/styles';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AxisX, AxisY, ChartAxis, ChartLegends, Point } from './styles';

type Props = {
  datas: any[];
};

class Chart extends React.PureComponent<Props> {
  renderPopover = data => {
    return (
      <Popover id="chart-popover">
        <ul>
          {data.names.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </Popover>
    );
  };

  renderPoint = data => {
    if (data.count === 1) {
      return (
        <Point key={Math.random()} y={data.y} x={data.x}>
          <span>{data.names[0]}</span>
        </Point>
      );
    }

    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        rootClose={true}
        overlay={this.renderPopover(data)}
      >
        <Point key={Math.random()} y={data.y} x={data.x}>
          <span>{`Tasks (${data.count})`}</span>
        </Point>
      </OverlayTrigger>
    );
  };

  render() {
    return (
      <RightContent>
        <ChartAxis>
          {this.props.datas.map(data => this.renderPoint(data))}

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

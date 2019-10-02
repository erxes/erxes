import { __ } from 'modules/common/utils';
import { RightContent } from 'modules/growthHacks/styles';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import {
  AxisX,
  AxisY,
  ChartAxis,
  ChartLegends,
  ExperimentList,
  Point,
  PopoverHeader
} from './styles';

type Props = {
  datas: any[];
};

class Chart extends React.PureComponent<Props> {
  renderPopover = data => {
    return (
      <Popover id="chart-popover">
        <PopoverHeader>Experiment names</PopoverHeader>
        <ExperimentList>
          {data.names.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ExperimentList>
      </Popover>
    );
  };

  renderPoint = data => {
    if (data.count === 1) {
      return (
        <Point key={Math.random()} x={data.x} y={data.y}>
          <span>{data.names[0]}</span>
        </Point>
      );
    }

    return (
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="bottom"
        rootClose={true}
        overlay={this.renderPopover(data)}
        key={Math.random()}
      >
        <Point x={data.x} y={data.y}>
          <span>{`(${data.count}) Experiments`}</span>
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

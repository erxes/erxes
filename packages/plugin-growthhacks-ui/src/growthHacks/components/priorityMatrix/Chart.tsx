import { __ } from '@erxes/ui/src/utils/core';
import { RightContent } from '../../styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import {
  AxisX,
  AxisY,
  ChartAxis,
  ChartLegends,
  ExperimentList,
  Point
} from './styles';

type Props = {
  datas: any[];
};

class Chart extends React.PureComponent<Props> {
  renderPopover = data => {
    return (
      <Popover id="chart-popover">
        <Popover.Title as="h3">{__('Experiment names')}</Popover.Title>
        <Popover.Content>
          <ExperimentList>
            {data.names.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ExperimentList>
        </Popover.Content>
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
        placement="auto"
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

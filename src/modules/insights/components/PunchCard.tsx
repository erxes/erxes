import { Tip } from 'modules/common/components';
import * as React from 'react';
import {
  ChartWrapper,
  FlexRow,
  PunchCardWrapper,
  PunchCell,
  PunchCircle,
  PunchDates,
  PunchHours
} from '../styles';
import { IPunchCardData } from '../types';

type Props = {
  data: IPunchCardData[];
  width: number;
};

const paddinLeftSize = 120;

class PunchCard extends React.Component<Props> {
  renderCells(day: number) {
    const { data, width } = this.props;
    const max = Math.max.apply(Math, data.map(o => o.count));

    const row: any = [];

    for (let i = 0; i < 24; i++) {
      const obj = (data.find(
        o => o.day === day && o.hour === i
      ) as IPunchCardData) || { count: 0 };
      const cellHeight = Math.floor((width - paddinLeftSize) / 24);

      row.push(
        <PunchCell key={Math.random()} height={cellHeight}>
          <Tip text={obj.count}>
            <PunchCircle
              radius={Math.floor((cellHeight * 0.9 * obj.count) / max)}
            >
              {obj.count}
            </PunchCircle>
          </Tip>
        </PunchCell>
      );
    }

    return row;
  }

  renderRows() {
    const html: any = [];

    for (let i = 0; i < 7; i++) {
      html.push(
        <FlexRow key={Math.random()}>{this.renderCells(i + 1)}</FlexRow>
      );
    }

    return html;
  }

  renderHours() {
    const html: any = [];
    const { width } = this.props;
    const cellHeight = Math.floor((width - paddinLeftSize) / 24);

    for (let i = 0; i < 24; i++) {
      html.push(
        <PunchCell key={Math.random()} height={cellHeight}>
          {i}
        </PunchCell>
      );
    }

    return (
      <PunchHours>
        <FlexRow>{html}</FlexRow>
      </PunchHours>
    );
  }

  renderDates() {
    const { data, width } = this.props;
    const cellHeight = Math.floor((width - paddinLeftSize) / 24);

    const dates: string[] = [];

    data.map(obj => {
      if (!dates.includes(obj.date)) {
        dates.push(obj.date);
      }
    });

    const html: any = [];

    dates.sort().map(date => {
      html.push(
        <PunchCell key={Math.random()} height={cellHeight}>
          {date}
        </PunchCell>
      );
    });

    return <PunchDates width={paddinLeftSize - 10}>{html}</PunchDates>;
  }

  render() {
    return (
      <ChartWrapper>
        <PunchCardWrapper paddingLeft={paddinLeftSize}>
          {this.renderDates()}
          {this.renderRows()}
          {this.renderHours()}
        </PunchCardWrapper>
      </ChartWrapper>
    );
  }
}

export default PunchCard;

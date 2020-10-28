import EmptyState from 'modules/common/components/EmptyState';
import Tip from 'modules/common/components/Tip';
import React from 'react';
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
  private dates: any[];

  constructor(props) {
    super(props);

    this.dates = Array.from(new Set(props.data.map(data => data.date))).sort();
  }

  renderCells(date: string) {
    const { data, width } = this.props;
    const max = Math.max.apply(
      Math,
      data.map(o => o.count)
    );

    const cellHeight = Math.floor((width - paddinLeftSize) / 24);
    const row: any = [];

    for (let i = 0; i < 24; i++) {
      const obj = (data.find(
        o => o.date === date && o.hour === i
      ) as IPunchCardData) || { count: 0 };

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

    for (const date of this.dates) {
      html.push(
        <FlexRow key={Math.random()}>{this.renderCells(date)}</FlexRow>
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
          {i}h
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
    const { width } = this.props;
    const cellHeight = Math.floor((width - paddinLeftSize) / 24);

    const html: any = [];

    this.dates.forEach(date => {
      html.push(
        <PunchCell key={Math.random()} height={cellHeight}>
          {date}
        </PunchCell>
      );
    });

    return <PunchDates width={paddinLeftSize - 10}>{html}</PunchDates>;
  }

  render() {
    if (this.props.data.length === 0) {
      return (
        <ChartWrapper>
          <EmptyState text="There is no data" size="full" icon="ban" />
        </ChartWrapper>
      );
    }

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

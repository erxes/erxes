import MainActionBar from 'modules/boards/containers/MainActionBar';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import Calendar from 'modules/common/components/Calendar';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import styled from 'styled-components';
import DealColumn from '../../containers/calendar/DealColumn';
import DealMainActionBar from '../DealMainActionBar';

type Props = {
  queryParams: any;
};

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const toKey = ({ year, month }: IDateColumn) => {
  return year + '-' + month;
};

class CalendarView extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onColumnUpdated = (date: IDateColumn) => {
    this.setState({ [toKey(date)]: new Date().toString() });
  };

  renderColumn = (date: IDateColumn) => {
    const { queryParams } = this.props;
    const key = toKey(date);

    return (
      <DealColumn
        updatedAt={`${key}-${this.state[key]}`}
        date={date}
        queryParams={queryParams}
        onColumnUpdated={this.onColumnUpdated}
        pipelineId={queryParams.pipelineId}
      />
    );
  };

  renderActionBar = (renderMiddleContent: () => React.ReactNode) => {
    return (
      <MainActionBar
        type="deal"
        component={DealMainActionBar}
        middleContent={renderMiddleContent}
      />
    );
  };

  renderMonthView(renderMonths: () => React.ReactNode[]) {
    return <Container>{renderMonths()}</Container>;
  }

  renderContent = (
    renderMonths: () => React.ReactNode[],
    renderMiddleContent: () => React.ReactNode
  ) => {
    const breadcrumb = [{ title: __('Deal') }];

    return (
      <BoardContainer>
        <Header title={__('Deal')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar(renderMiddleContent)}
          <ScrolledContent transparent={true}>
            {this.renderMonthView(renderMonths)}
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  };

  render() {
    return (
      <Calendar
        renderContent={this.renderContent}
        renderColumn={this.renderColumn}
      />
    );
  }
}

export default CalendarView;

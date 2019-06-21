import { Calendar } from 'modules/common/components';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import styled from 'styled-components';
import { DealColumn, MainActionBar } from '../../containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from '../../styles/common';

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
    return <MainActionBar middleContent={renderMiddleContent} />;
  };

  renderMonthView(renderMonths: () => React.ReactNode[]) {
    return <Container>{renderMonths()}</Container>;
  }

  renderContent = (
    renderMonths: () => React.ReactNode[],
    renderMiddleContent: () => React.ReactNode
  ) => {
    return (
      <BoardContainer>
        <Header title={__('Deal')} submenu={menuDeal} />
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

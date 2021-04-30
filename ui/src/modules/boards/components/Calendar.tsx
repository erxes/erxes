import MainActionBar from 'modules/boards/containers/MainActionBar';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import Calendar from 'modules/common/components/Calendar';
import { colors } from 'modules/common/styles';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import styled from 'styled-components';

export const ColumnContainer = styled.div`
  position: relative;
  height: 100%;
`;

export const ColumnContentBody = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 0 4px 90px;
  margin: 0 4px;
  overflow-y: auto;
`;

export const ColumnFooter = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 31px;
  left: 0;
  right: 0;
  text-align: center;
  background: ${colors.bgLight};
`;

export type ColumnProps = {
  updatedAt: string;
  pipelineId: string;
  date: IDateColumn;
  queryParams: any;
  onColumnUpdated: (date: IDateColumn) => void;
};

export const getCommonParams = queryParams => {
  if (!queryParams) {
    return {};
  }

  return {
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    productIds: queryParams.productIds,
    labelIds: queryParams.labelIds,
    search: queryParams.search,
    userIds: queryParams.userIds
  };
};

type Props = {
  type: string;
  title: string;
  queryParams: any;
  ItemColumnComponent;
  MainActionBarComponent;
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
    const { queryParams, ItemColumnComponent } = this.props;
    const key = toKey(date);

    return (
      <ItemColumnComponent
        updatedAt={`${key}-${this.state[key]}`}
        date={date}
        queryParams={queryParams}
        onColumnUpdated={this.onColumnUpdated}
        pipelineId={queryParams.pipelineId}
      />
    );
  };

  renderActionBar = (renderMiddleContent: () => React.ReactNode) => {
    const { MainActionBarComponent, type } = this.props;

    return (
      <MainActionBar
        type={type}
        component={MainActionBarComponent}
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
    const { title } = this.props;
    const breadcrumb = [{ title: __(title) }];

    return (
      <BoardContainer>
        <Header title={__(title)} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar(renderMiddleContent)}
          <ScrolledContent>
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

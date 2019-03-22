import { Calendar } from 'modules/common/components';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import styled from 'styled-components';
import { DealColumn, MainActionBar } from '../../containers';

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
    const breadcrumb = [{ title: __('Deal') }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar(renderMiddleContent)}
        content={this.renderMonthView(renderMonths)}
        transparent={true}
      />
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

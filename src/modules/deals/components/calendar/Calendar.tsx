import { Calendar } from 'modules/common/components';
import { IDateColumn, IQueryParams } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import DealProvider, {
  DealConsumer
} from 'modules/deals/containers/DealContext';
import withPipelineDetail from 'modules/deals/containers/withPipeline';
import { IPipeline } from 'modules/deals/types';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import styled from 'styled-components';
import { DealColumn, MainActionBar } from '../../containers';
import {
  BoardContainer,
  BoardContent,
  PipelineContent
} from '../../styles/common';

type Props = {
  queryParams: IQueryParams;
  pipeline: IPipeline;
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

  renderMonthView(
    renderMonths: () => React.ReactNode[],
    backgroundColor: string = ''
  ) {
    const { pipeline } = this.props;

    return (
      <PipelineContent color={backgroundColor || pipeline.backgroundColor}>
        <Container>{renderMonths()}</Container>
      </PipelineContent>
    );
  }

  renderContent = (
    renderMonths: () => React.ReactNode[],
    renderMiddleContent: () => React.ReactNode
  ) => {
    const breadcrumb = [{ title: __('Deal') }];

    return (
      <DealProvider>
        <DealConsumer>
          {({ backgroundColor }) => (
            <BoardContainer>
              <Header title={__('Deal')} breadcrumb={breadcrumb} />
              <BoardContent transparent={true}>
                {this.renderActionBar(renderMiddleContent)}
                {this.renderMonthView(renderMonths, backgroundColor)}
              </BoardContent>
            </BoardContainer>
          )}
        </DealConsumer>
      </DealProvider>
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

export default withPipelineDetail(CalendarView);

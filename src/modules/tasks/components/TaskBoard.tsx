import { Board, MainActionBar } from 'modules/boards/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { Header } from 'modules/layout/components';
import React from 'react';
import { TaskMainActionBar } from '.';
import options from '../options';

type Props = {
  queryParams: any;
};
class TaskBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return <MainActionBar type="task" component={TaskMainActionBar} />;
  }

  render() {
    const breadcrumb = [{ title: __('Task') }];

    return (
      <BoardContainer>
        <Header title={__('Task')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          <ScrolledContent transparent={true}>
            {this.renderContent()}
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default TaskBoard;

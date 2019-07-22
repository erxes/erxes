import Board from 'modules/boards/containers/Board';
import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import options from '../options';
import TaskMainActionBar from './TaskMainActionBar';

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
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default TaskBoard;

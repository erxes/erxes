import {
  ColumnContainer,
  ColumnContentBody,
  ColumnFooter
} from 'modules/boards/components/Calendar';
import { AddNew } from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import options from '../options';
import { ITask } from '../types';
import Task from './TaskItem';

type Props = {
  tasks: ITask[];
  totalCount: number;
  date: IDateColumn;
  onLoadMore: (skip: number) => void;
};

class TaskColumn extends React.Component<Props, {}> {
  onLoadMore = () => {
    const { tasks, onLoadMore } = this.props;
    onLoadMore(tasks.length);
  };

  renderContent() {
    const { tasks } = this.props;

    if (tasks.length === 0) {
      return <EmptyState icon="postcard" text="No tasks" />;
    }

    const contents = tasks.map((task: ITask, index: number) => (
      <Task options={options} key={index} item={task} portable={true} />
    ));

    return <ColumnContentBody>{contents}</ColumnContentBody>;
  }

  renderFooter() {
    const { tasks, totalCount } = this.props;

    if (tasks.length === totalCount || tasks.length > totalCount) {
      return null;
    }

    return (
      <ColumnFooter>
        <AddNew onClick={this.onLoadMore}>
          <Icon icon="refresh" /> {__('Load more')}
        </AddNew>
      </ColumnFooter>
    );
  }

  render() {
    return (
      <ColumnContainer>
        {this.renderContent()}
        {this.renderFooter()}
      </ColumnContainer>
    );
  }
}

export default TaskColumn;

import * as compose from 'lodash.flowright';
import { ColumnProps } from 'modules/boards/components/Calendar';
import { calendarColumnQuery, onCalendarLoadMore } from 'modules/boards/utils';
import { withProps } from 'modules/common/utils';
import { getMonthTitle } from 'modules/common/utils/calendar';
import CalendarColumn from 'modules/tasks/components/CalendarColumn';
import React from 'react';
import { queries } from '../graphql';
import { TasksQueryResponse, TasksTotalCountQueryResponse } from '../types';

type FinalProps = ColumnProps & {
  tasksQuery: TasksQueryResponse;
  tasksTotalCountQuery: TasksTotalCountQueryResponse;
};

class TaskColumnContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const { updatedAt, tasksQuery, tasksTotalCountQuery } = this.props;

    if (updatedAt !== nextProps.updatedAt) {
      tasksQuery.refetch();
      tasksTotalCountQuery.refetch();
    }
  }

  render() {
    const {
      tasksQuery,
      tasksTotalCountQuery,
      date: { month }
    } = this.props;

    const { fetchMore } = tasksQuery;

    // Update calendar after stage updated
    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      tasksQuery.refetch();
      tasksTotalCountQuery.refetch();
    }

    const title = getMonthTitle(month);
    const tasks = tasksQuery.tasks || [];
    const totalCount = tasksTotalCountQuery.tasksTotalCount || 0;

    const onLoadMore = (skip: number) => {
      return onCalendarLoadMore(fetchMore, 'tasks', skip);
    };

    const updatedProps = {
      ...this.props,
      tasks,
      totalCount,
      title,
      onLoadMore
    };

    return <CalendarColumn {...updatedProps} />;
  }
}

export default withProps<ColumnProps>(
  compose(
    calendarColumnQuery(queries.tasks, 'tasksQuery'),
    calendarColumnQuery(queries.tasksTotalCount, 'tasksTotalCountQuery')
  )(TaskColumnContainer)
);

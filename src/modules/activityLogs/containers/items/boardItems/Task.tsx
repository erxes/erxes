import gql from 'graphql-tag';
import Task from 'modules/activityLogs/components/items/boardItems/Task';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/tasks/graphql';
import { TaskDetailQueryResponse } from 'modules/tasks/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  taskId: string;
};

type FinalProps = {
  taskDetailsQuery: TaskDetailQueryResponse;
} & Props;

class FormContainer extends React.Component<FinalProps> {
  render() {
    const { taskDetailsQuery } = this.props;

    if (taskDetailsQuery.loading) {
      return <Spinner />;
    }

    const task = taskDetailsQuery.taskDetail;

    const updatedProps = {
      ...this.props,
      task
    };

    return <Task {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, TaskDetailQueryResponse>(gql(queries.taskDetail), {
      name: 'taskDetailsQuery',
      options: ({ taskId }) => ({
        variables: {
          _id: taskId
        }
      })
    })
  )(FormContainer)
);

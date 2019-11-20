import gql from 'graphql-tag';
import Task from 'modules/activityLogs/components/items/boardItems/Task';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/tasks/graphql';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  TaskDetailQueryResponse
} from 'modules/tasks/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  taskId: string;
};

type FinalProps = {
  taskDetailsQuery: TaskDetailQueryResponse;
  editMutation: EditMutationResponse;
} & Props &
  RemoveMutationResponse;

class FormContainer extends React.Component<FinalProps> {
  render() {
    const { taskDetailsQuery, editMutation, removeMutation } = this.props;

    if (taskDetailsQuery.loading) {
      return <Spinner />;
    }

    const task = taskDetailsQuery.taskDetail;

    const save = (variables, callback) => {
      editMutation({ variables })
        .then(() => {
          Alert.success('You successfully edited a task.');

          if (callback) {
            callback();
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const remove = (taskId: string) => {
      confirm().then(() =>
        removeMutation({ variables: { _id: taskId } })
          .then(() => {
            Alert.success('You successfully deleted a task.');
          })
          .catch(error => {
            Alert.error(error.message);
          })
      );
    };

    const updatedProps = {
      ...this.props,
      task,
      save,
      remove
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
    }),
    graphql<Props, EditMutationResponse>(gql(mutations.tasksEdit), {
      name: 'editMutation'
    })
  )(FormContainer)
);

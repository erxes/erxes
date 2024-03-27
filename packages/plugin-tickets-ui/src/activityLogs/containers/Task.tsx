import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '@erxes/ui-cards/src/tasks/graphql';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  TaskDetailQueryResponse
} from '@erxes/ui-cards/src/tasks/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Task from '../components/Task';
import Spinner from '@erxes/ui/src/components/Spinner';

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

    if (!task) {
      return <strong>You do not have permission to view this task</strong>;
    }

    const save = (variables, callback) => {
      editMutation({ variables })
        .then(() => {
          Alert.success('You successfully updated a task.');

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
    }),
    graphql<Props, RemoveMutationResponse>(gql(mutations.tasksRemove), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['activityLogs']
      })
    })
  )(FormContainer)
);

import { gql } from '~/gql';

export const REMOVE_TASK_MUTATION = gql(`
  mutation RemoveTask($id: String!) {
    removeTask(_id: $id) {
      _id
    }
  }
`);

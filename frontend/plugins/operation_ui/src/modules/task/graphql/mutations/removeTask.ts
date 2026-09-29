import { graphql } from '~/gql';

export const REMOVE_TASK_MUTATION = graphql(`
  mutation RemoveTask($id: String!) {
    removeTask(_id: $id) {
      _id
    }
  }
`);

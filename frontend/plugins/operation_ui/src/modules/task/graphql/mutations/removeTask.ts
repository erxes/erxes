import { gql } from '@apollo/client';

export const REMOVE_TASK_MUTATION = gql`
  mutation RemoveTask($id: String!) {
    removeTask(_id: $id) {
      _id
    }
  }
`;

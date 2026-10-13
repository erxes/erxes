import { gql } from '~/gql';

export const REMOVE_PROJECT_MUTATION = gql(`
  mutation removeProject($_id: String!) {
    removeProject(_id: $_id)
  }
`);

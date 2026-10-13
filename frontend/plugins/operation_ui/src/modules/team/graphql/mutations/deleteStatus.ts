import { gql } from '~/gql';

export const DELETE_STATUS = gql(`
  mutation DeleteStatus($id: String!) {
    deleteStatus(_id: $id)
  }
`);

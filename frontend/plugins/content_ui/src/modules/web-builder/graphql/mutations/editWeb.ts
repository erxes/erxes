import { gql } from '~/gql';

export const EDIT_WEB = gql(`
  mutation EditWeb($id: String!, $doc: WebInput!) {
    editWeb(_id: $id, doc: $doc) {
      _id
    }
  }
`);

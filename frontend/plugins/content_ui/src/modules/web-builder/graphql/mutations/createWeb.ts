import { gql } from '~/gql';

export const CREATE_WEB = gql(`
  mutation CreateWeb($doc: WebCreateInput!) {
    createWeb(doc: $doc) {
      _id
    }
  }
`);

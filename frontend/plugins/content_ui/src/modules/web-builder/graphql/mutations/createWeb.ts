import { gql } from '@apollo/client';

export const CREATE_WEB = gql`
  mutation CreateWeb($doc: WebCreateInput!) {
    createWeb(doc: $doc) {
      _id
    }
  }
`;

import { gql } from '@apollo/client';

export const CREATE_WEB = gql`
  mutation CreateWeb($doc: WebInput!) {
    createWeb(doc: $doc) {
      _id
    }
  }
`;

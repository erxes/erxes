import { gql } from '@apollo/client';

const EDIT_APP = gql`
  mutation AppsEdit($_id: String!, $name: String) {
    appsEdit(_id: $_id, name: $name) {
      _id
      name
      token
      status
      lastUsedAt
      createdAt
    }
  }
`;

export { EDIT_APP };

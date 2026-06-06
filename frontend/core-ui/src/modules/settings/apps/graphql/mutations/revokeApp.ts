import { gql } from '@apollo/client';

const REVOKE_APP = gql`
  mutation AppsRevoke($_id: String!) {
    appsRevoke(_id: $_id) {
      _id
      name
      token
      status
      lastUsedAt
      createdAt
    }
  }
`;

export { REVOKE_APP };

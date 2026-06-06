import { gql } from '@apollo/client';

const ADD_APP = gql`
  mutation AppsAdd($name: String!) {
    appsAdd(name: $name) {
      _id
      name
      token
      status
      lastUsedAt
      createdAt
    }
  }
`;

export { ADD_APP };

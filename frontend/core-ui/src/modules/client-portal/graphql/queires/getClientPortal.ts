import { gql } from '@apollo/client';

export const GET_CLIENT_PORTAL = gql`
  query getClientPortal($_id: String!) {
    getClientPortal(_id: $_id) {
      _id
      name
      description
      domain
      createdAt
      updatedAt
      token
    }
  }
`;

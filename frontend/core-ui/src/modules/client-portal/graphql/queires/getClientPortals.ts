import { gql } from '@apollo/client';

export const GET_CLIENT_PORTALS = gql`
  query getClientPortals($filter: IClientPortalFilter) {
    getClientPortals(filter: $filter) {
      _id
      name
      createdAt
      updatedAt
    }
  }
`;

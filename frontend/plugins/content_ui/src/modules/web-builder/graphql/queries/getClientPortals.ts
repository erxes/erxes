import { gql } from '@apollo/client';

export const GET_CLIENT_PORTALS = gql`
  query GetClientPortals($filter: IClientPortalFilter) {
    getClientPortals(filter: $filter) {
      list {
        _id
        name
      }
    }
  }
`;

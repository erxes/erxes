import { gql } from '@apollo/client';

export const GET_CLIENT_PORTALS = gql`
  query getClientPortals($filter: IClientPortalFilter) {
    getClientPortals(filter: $filter) {
      list {
        _id
        name
        domain
        token
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;

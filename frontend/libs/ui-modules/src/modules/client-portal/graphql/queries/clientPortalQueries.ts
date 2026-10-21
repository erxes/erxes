import { gql } from '@apollo/client';

export const CLIENT_PORTAL_SELECT_LIST = gql`
  query ClientPortalSelectList {
    getClientPortals {
      list {
        _id
        name
      }
      totalCount
    }
  }
`;

export const CLIENT_PORTAL_SELECT_DETAIL = gql`
  query ClientPortalSelectDetail($_id: String) {
    getClientPortal(_id: $_id) {
      _id
      name
    }
  }
`;

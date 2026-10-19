import { gql } from '~/gql';

export const GET_CLIENT_PORTALS = gql(`
  query WebBuilderClientPortals($filter: IClientPortalFilter) {
    getClientPortals(filter: $filter) {
      list {
        _id
        name
      }
    }
  }
`);

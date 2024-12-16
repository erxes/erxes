import { gql } from '@apollo/client';

const GET_LAST_QUERY = gql`
  query clientPortalGetLast($kind: BusinessPortalKind) {
    clientPortalGetLast(kind: $kind) {
      _id
      name
      domain
      url
    }
  }
`;

const DETAIL_QUERY = gql`
  query ClientPortalGetConfig($id: String!) {
    clientPortalGetConfig(_id: $id) {
      _id
      name
      domain
      url
    }
  }
`;

export default {
  GET_LAST_QUERY,
  DETAIL_QUERY,
};

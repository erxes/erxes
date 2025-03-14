import { gql } from '@apollo/client';

export const WEB_DETAIL = gql`
  query ClientPortalGetConfig($id: String!) {
    clientPortalGetConfig(_id: $id) {
      _id
      domain
      name
      url
    }
  }
`;

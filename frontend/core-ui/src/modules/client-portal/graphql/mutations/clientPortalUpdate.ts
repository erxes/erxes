import { gql } from '@apollo/client';

export const CLIENT_PORTAL_UPDATE = gql`
  mutation ClientPortalUpdate(
    $id: String!
    $clientPortal: ClientPortalConfigInput
  ) {
    clientPortalUpdate(_id: $id, clientPortal: $clientPortal) {
      _id
    }
  }
`;

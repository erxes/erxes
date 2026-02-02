import { gql } from '@apollo/client';

export const CLIENT_PORTAL_REMOVE = gql`
  mutation ClientPortalDelete($id: String!) {
    clientPortalDelete(_id: $id)
  }
`;

import { gql } from '@apollo/client';

export const CLIENT_PORTAL_DELETE = gql`
  mutation ClientPortalDelete($_id: String!) {
    clientPortalDelete(_id: $_id)
  }
`;

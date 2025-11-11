import { gql } from '@apollo/client';

export const EDIT_CLIENT_PORTAL = gql`
  mutation EditClientPortal($input: ClientPortalConfigInput!) {
    editClientPortal(input: $input) {
      _id
    }
  }
`;

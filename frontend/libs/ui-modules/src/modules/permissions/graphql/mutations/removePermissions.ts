import { gql } from '@apollo/client';

export const REMOVE_PERMISSIONS = gql`
  mutation PermissionsRemove($ids: [String]!) {
    permissionsRemove(ids: $ids)
  }
`;

import { gql } from '@apollo/client';

export const ROLES_UPSERT = gql`
  mutation RolesUpsert($userId: String!, $role: ROLE!) {
    rolesUpsert(userId: $userId, role: $role) {
      role
    }
  }
`;
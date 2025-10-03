import { gql } from '@apollo/client';

export const FIX_PERMISSIONS = gql`
  mutation Mutation {
    permissionsFix
  }
`;

import { gql } from '@apollo/client';

export const AUTH_TWO_FACTOR_POLICY = gql`
  query authTwoFactorPolicy {
    authTwoFactorPolicy {
      mode
      permissionGroupIds
    }
  }
`;

export const AUTH_TWO_FACTOR_POLICY_SAVE = gql`
  mutation authTwoFactorPolicySave(
    $mode: AuthTwoFactorMode!
    $permissionGroupIds: [String!]!
  ) {
    authTwoFactorPolicySave(
      mode: $mode
      permissionGroupIds: $permissionGroupIds
    ) {
      mode
      permissionGroupIds
    }
  }
`;

export const AUTH_TWO_FACTOR_RESET = gql`
  mutation authTwoFactorReset($userId: String!) {
    authTwoFactorReset(userId: $userId)
  }
`;

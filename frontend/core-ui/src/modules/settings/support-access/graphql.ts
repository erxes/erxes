import { gql } from '@apollo/client';

const AUTH_SUPPORT_GRANT_FIELDS = gql`
  fragment AuthSupportGrantFields on AuthSupportGrant {
    _id
    staffName
    staffEmail
    userId
    reason
    status
    autoApproved
    permissionGroupIds
    decidedBy
    endsAt
    revokedAt
    visits {
      enteredAt
      reason
    }
    createdAt
  }
`;

const AUTH_SUPPORT_ACCESS_POLICY_FIELDS = gql`
  fragment AuthSupportAccessPolicyFields on AuthSupportAccessPolicy {
    available
    mode
    configuredMode
    allowUntil
    permissionGroupIds
  }
`;

export const AUTH_SUPPORT_ACCESS_POLICY = gql`
  ${AUTH_SUPPORT_ACCESS_POLICY_FIELDS}
  query authSupportAccessPolicy {
    authSupportAccessPolicy {
      ...AuthSupportAccessPolicyFields
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_GRANTS = gql`
  ${AUTH_SUPPORT_GRANT_FIELDS}
  query authSupportAccessGrants {
    authSupportAccessGrants {
      ...AuthSupportGrantFields
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_ACTIVE = gql`
  query authSupportAccessActive {
    authSupportAccessActive {
      _id
      staffName
      endsAt
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_POLICY_SAVE = gql`
  ${AUTH_SUPPORT_ACCESS_POLICY_FIELDS}
  mutation authSupportAccessPolicySave(
    $mode: AuthSupportAccessMode!
    $allowUntil: Date
    $permissionGroupIds: [String!]!
  ) {
    authSupportAccessPolicySave(
      mode: $mode
      allowUntil: $allowUntil
      permissionGroupIds: $permissionGroupIds
    ) {
      ...AuthSupportAccessPolicyFields
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_APPROVE = gql`
  ${AUTH_SUPPORT_GRANT_FIELDS}
  mutation authSupportAccessApprove(
    $_id: String!
    $hours: Int!
    $permissionGroupIds: [String!]!
  ) {
    authSupportAccessApprove(
      _id: $_id
      hours: $hours
      permissionGroupIds: $permissionGroupIds
    ) {
      ...AuthSupportGrantFields
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_DENY = gql`
  ${AUTH_SUPPORT_GRANT_FIELDS}
  mutation authSupportAccessDeny($_id: String!) {
    authSupportAccessDeny(_id: $_id) {
      ...AuthSupportGrantFields
    }
  }
`;

export const AUTH_SUPPORT_ACCESS_REVOKE = gql`
  ${AUTH_SUPPORT_GRANT_FIELDS}
  mutation authSupportAccessRevoke($_id: String!) {
    authSupportAccessRevoke(_id: $_id) {
      ...AuthSupportGrantFields
    }
  }
`;

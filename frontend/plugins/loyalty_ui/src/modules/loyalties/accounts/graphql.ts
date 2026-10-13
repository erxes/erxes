import { gql } from '@apollo/client';

const LOYALTY_ACCOUNT_FIELDS = gql`
  fragment LoyaltyAccountFields on LoyaltyAccount {
    _id
    number
    status
    joinedAt
    frozenAt
    frozenReason
    balances {
      accountTypeId
      balance
      pending
      expiringSoon {
        amount
        expiresAt
      }
      updatedAt
      tier {
        key
        name
        order
        deprecated
      }
      tierSince
      accountType {
        _id
        name
        status
        tiers {
          key
          name
          order
          deprecated
        }
      }
    }
  }
`;

export const LOYALTY_ACCOUNT_OF_OWNER = gql`
  ${LOYALTY_ACCOUNT_FIELDS}
  query LoyaltyAccountOfOwner($ownerType: String!, $ownerId: String!) {
    loyaltyAccountOfOwner(ownerType: $ownerType, ownerId: $ownerId) {
      ...LoyaltyAccountFields
    }
  }
`;

export const LOYALTY_ACCOUNTS = gql`
  ${LOYALTY_ACCOUNT_FIELDS}
  query LoyaltyAccounts(
    $searchValue: String
    $ownerType: String
    $status: String
    $accountTypeId: String
    $tier: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    loyaltyAccounts(
      searchValue: $searchValue
      ownerType: $ownerType
      status: $status
      accountTypeId: $accountTypeId
      tier: $tier
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      list {
        ...LoyaltyAccountFields
        ownerType
        ownerId
        owner
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const LOYALTY_ACCOUNT_FREEZE = gql`
  ${LOYALTY_ACCOUNT_FIELDS}
  mutation LoyaltyAccountFreeze($_id: String!, $reason: String!) {
    loyaltyAccountFreeze(_id: $_id, reason: $reason) {
      ...LoyaltyAccountFields
    }
  }
`;

export const LOYALTY_ACCOUNT_SET_TIER = gql`
  ${LOYALTY_ACCOUNT_FIELDS}
  mutation LoyaltyAccountSetTier(
    $_id: String!
    $accountTypeId: String!
    $tier: String
  ) {
    loyaltyAccountSetTier(
      _id: $_id
      accountTypeId: $accountTypeId
      tier: $tier
    ) {
      ...LoyaltyAccountFields
    }
  }
`;

export const LOYALTY_ACCOUNT_UNFREEZE = gql`
  ${LOYALTY_ACCOUNT_FIELDS}
  mutation LoyaltyAccountUnfreeze($_id: String!) {
    loyaltyAccountUnfreeze(_id: $_id) {
      ...LoyaltyAccountFields
    }
  }
`;

export const LOYALTY_TIER_LOGS = gql`
  query LoyaltyTierLogs($accountId: String, $targetId: String, $limit: Int) {
    loyaltyTierLogs(accountId: $accountId, targetId: $targetId, limit: $limit) {
      _id
      ownerType
      ownerId
      owner
      accountTypeId
      accountType {
        _id
        name
        tiers {
          key
          name
          order
          deprecated
        }
      }
      fromTier
      toTier
      direction
      createdBy
      createdVia
      targetId
      targetType
      targetName
      createdAt
    }
  }
`;

import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type LoyaltyExpiringPoints {
    amount: Float!
    expiresAt: Date!
  }

  type LoyaltyAccountBalance {
    accountTypeId: String!
    accountType: LoyaltyAccountType
    balance: Float
    pending: Float
    expiringSoon: LoyaltyExpiringPoints
    updatedAt: Date
    tier: LoyaltyTier
    tierSince: Date
    resetAt: Date
  }

  type LoyaltyAccount {
    _id: String!
    number: String!
    ownerType: String!
    ownerId: String!
    status: String!
    balances: [LoyaltyAccountBalance]
    joinedAt: Date
    frozenAt: Date
    frozenBy: String
    frozenReason: String
    owner: JSON
  }

  type LoyaltyAccountListResponse {
    list: [LoyaltyAccount]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  loyaltyAccountOfOwner(ownerType: String!, ownerId: String!): LoyaltyAccount
  loyaltyAccounts(
    searchValue: String
    ownerType: String
    status: String
    accountTypeId: String
    tier: String
    ${GQL_CURSOR_PARAM_DEFS}
  ): LoyaltyAccountListResponse
`;

export const mutations = `
  loyaltyAccountFreeze(_id: String!, reason: String!): LoyaltyAccount
  loyaltyAccountUnfreeze(_id: String!): LoyaltyAccount
  loyaltyAccountSetTier(_id: String!, accountTypeId: String!, tier: String): LoyaltyAccount
`;

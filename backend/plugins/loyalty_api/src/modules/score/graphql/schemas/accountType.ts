export const types = `
  type LoyaltyTier {
    key: String!
    name: String!
    order: Int!
    deprecated: Boolean
  }

  type LoyaltyAccountTypeReset {
    period: String!
    tierTo: String
    since: Date
    lastBoundary: Date
  }

  input LoyaltyTierInput {
    key: String
    name: String!
  }

  input LoyaltyAccountTypeResetInput {
    period: String!
    tierTo: String
  }

  type LoyaltyAccountTypeExpiry {
    mode: String!
    months: Int
  }

  input LoyaltyAccountTypeExpiryInput {
    mode: String!
    months: Int
  }

  type LoyaltyAccountType {
    _id: String!
    name: String!
    ownerType: String!
    frozenBlocks: String
    tiers: [LoyaltyTier]
    reset: LoyaltyAccountTypeReset
    expiry: LoyaltyAccountTypeExpiry
    pendingDays: Int
    currencyRatio: Float
    pointValue: Float
    fieldId: String
    tierFieldId: String
    status: String!
    campaignCount: Int
    createdUserId: String
    createdAt: Date
    updatedAt: Date
  }

  type LoyaltyAccountTypeAdoption {
    accountTypeId: String
    name: String
    campaigns: Int
    recast: Int
    unreadable: Int
  }

  type LoyaltyAccountTypeAdoptionSkip {
    fieldId: String
    reason: String
  }

  type LoyaltyAccountTypeAdoptionResult {
    adopted: [LoyaltyAccountTypeAdoption]
    skipped: [LoyaltyAccountTypeAdoptionSkip]
  }
`;

export const queries = `
  loyaltyAccountTypes(status: String, ownerType: String): [LoyaltyAccountType]
  loyaltyAccountType(_id: String!): LoyaltyAccountType
  loyaltyAccountTypeLegacyFieldCount: Int
`;

export const mutations = `
  loyaltyAccountTypeAdd(name: String!, ownerType: String!, frozenBlocks: String, tiers: [LoyaltyTierInput], reset: LoyaltyAccountTypeResetInput, expiry: LoyaltyAccountTypeExpiryInput, pendingDays: Int, currencyRatio: Float, pointValue: Float): LoyaltyAccountType
  loyaltyAccountTypeEdit(_id: String!, name: String!, frozenBlocks: String, tiers: [LoyaltyTierInput], reset: LoyaltyAccountTypeResetInput, expiry: LoyaltyAccountTypeExpiryInput, pendingDays: Int, currencyRatio: Float, pointValue: Float): LoyaltyAccountType
  loyaltyAccountTypeArchive(_id: String!): LoyaltyAccountType
  loyaltyAccountTypeUnarchive(_id: String!): LoyaltyAccountType
  loyaltyAccountTypesAdoptCampaignFields: LoyaltyAccountTypeAdoptionResult
`;

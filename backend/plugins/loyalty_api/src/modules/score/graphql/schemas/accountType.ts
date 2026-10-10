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

  type LoyaltyEarnEligibility {
    who: String!
    segmentId: String
  }

  input LoyaltyEarnEligibilityInput {
    who: String!
    segmentId: String
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
    earnEligibility: LoyaltyEarnEligibility
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

  type LoyaltyTierChange {
    from: String
    to: String
    accounts: Int
  }

  type LoyaltyResetImpact {
    accounts: Int
    total: Int
    sampled: Boolean
    pointsCleared: Float
    pointsKept: Float
    tierChanges: [LoyaltyTierChange]
  }

  type LoyaltyAccountTypePeriodPreview {
    timeZone: String
    nextReset: Date
    noEarnFrom: Date
    earnedNowExpiresAt: Date
    pendingUntil: Date
    tierTo: String
    impact: LoyaltyResetImpact
  }

  type LoyaltyPeriodRun {
    _id: String
    startedAt: Date
    finishedAt: Date
    status: String
    batches: Int
    released: Int
    expired: Int
    reset: Int
    failed: Int
    error: String
  }

  type LoyaltyPeriodRunReset {
    accountTypeId: String
    name: String
    boundary: Date
    accounts: Int
  }

  type LoyaltyPeriodRunPreview {
    releasing: Int
    expiring: Int
    resets: [LoyaltyPeriodRunReset]
  }

  type LoyaltyPeriodRunStatus {
    nextRunAt: Date
    timeZone: String
    preview: LoyaltyPeriodRunPreview
    runs: [LoyaltyPeriodRun]
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
  loyaltyPeriodRunStatus: LoyaltyPeriodRunStatus
  loyaltyAccountTypePeriodPreview(_id: String, expiry: LoyaltyAccountTypeExpiryInput, reset: LoyaltyAccountTypeResetInput, pendingDays: Int): LoyaltyAccountTypePeriodPreview
`;

export const mutations = `
  loyaltyAccountTypeAdd(name: String!, ownerType: String!, frozenBlocks: String, tiers: [LoyaltyTierInput], reset: LoyaltyAccountTypeResetInput, expiry: LoyaltyAccountTypeExpiryInput, pendingDays: Int, currencyRatio: Float, pointValue: Float, earnEligibility: LoyaltyEarnEligibilityInput): LoyaltyAccountType
  loyaltyAccountTypeEdit(_id: String!, name: String!, frozenBlocks: String, tiers: [LoyaltyTierInput], reset: LoyaltyAccountTypeResetInput, expiry: LoyaltyAccountTypeExpiryInput, pendingDays: Int, currencyRatio: Float, pointValue: Float, earnEligibility: LoyaltyEarnEligibilityInput): LoyaltyAccountType
  loyaltyAccountTypeArchive(_id: String!): LoyaltyAccountType
  loyaltyAccountTypeUnarchive(_id: String!): LoyaltyAccountType
  loyaltyAccountTypesAdoptCampaignFields: LoyaltyAccountTypeAdoptionResult
`;

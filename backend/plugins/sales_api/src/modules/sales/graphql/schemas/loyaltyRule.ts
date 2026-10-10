const placeFields = `
  probability: String
  stageIds: [String]
`;

const tierBandFields = `
  tier: String!
  min: Float
  max: Float
`;

export const types = `
  type SalesLoyaltyRulePlace {
    ${placeFields}
  }

  input SalesLoyaltyRulePlaceInput {
    ${placeFields}
  }

  type SalesLoyaltyRule {
    _id: String!
    type: String!
    scoreCampaignId: String!
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlace
    refund: SalesLoyaltyRulePlace
    updatedBy: String
    updatedAt: Date
  }

  input SalesLoyaltyRuleInput {
    _id: String
    type: String!
    scoreCampaignId: String!
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlaceInput
    refund: SalesLoyaltyRulePlaceInput
  }

  type SalesLoyaltyTierBand {
    ${tierBandFields}
  }

  input SalesLoyaltyTierBandInput {
    ${tierBandFields}
  }

  type SalesLoyaltyTierRule {
    _id: String!
    type: String!
    accountTypeId: String!
    bands: [SalesLoyaltyTierBand!]!
    onlyUpgrade: Boolean
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlace
    updatedBy: String
    updatedAt: Date
  }

  input SalesLoyaltyTierRuleInput {
    _id: String
    type: String!
    accountTypeId: String!
    bands: [SalesLoyaltyTierBandInput!]!
    onlyUpgrade: Boolean
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlaceInput
  }
`;

export const queries = `
  salesLoyaltyRules: [SalesLoyaltyRule]
  salesLoyaltyTierRules: [SalesLoyaltyTierRule]
`;

export const mutations = `
  salesLoyaltyRulesSave(rules: [SalesLoyaltyRuleInput!]!): [SalesLoyaltyRule]
  salesLoyaltyTierRulesSave(
    rules: [SalesLoyaltyTierRuleInput!]!
  ): [SalesLoyaltyTierRule]
`;
